/*
  # Fix RLS policies to prevent infinite recursion

  1. Security Updates
    - Remove problematic RLS policies that cause infinite recursion
    - Create simplified policies that don't reference the same table
    - Ensure proper access control without circular dependencies

  2. Changes
    - Drop existing policies on students table
    - Create new simplified policies
    - Update coding_profiles and coding_stats policies if needed
*/

-- Drop existing problematic policies on students table
DROP POLICY IF EXISTS "Admins can read all students" ON students;
DROP POLICY IF EXISTS "Admins can update all students" ON students;
DROP POLICY IF EXISTS "Students can read own data" ON students;
DROP POLICY IF EXISTS "Students can update own data" ON students;

-- Create simplified policies for students table
CREATE POLICY "Users can read own student data"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own student data"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own student data"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update coding_profiles policies to be simpler
DROP POLICY IF EXISTS "Admins can manage all profiles" ON coding_profiles;
DROP POLICY IF EXISTS "Students can manage own profiles" ON coding_profiles;

CREATE POLICY "Users can manage own coding profiles"
  ON coding_profiles
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Update coding_stats policies to be simpler
DROP POLICY IF EXISTS "Admins can read all stats" ON coding_stats;
DROP POLICY IF EXISTS "Students can read own stats" ON coding_stats;

CREATE POLICY "Users can read own coding stats"
  ON coding_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coding_profiles 
      WHERE coding_profiles.id = coding_stats.profile_id 
      AND coding_profiles.student_id = auth.uid()
    )
  );

CREATE POLICY "System can manage coding stats"
  ON coding_stats
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);