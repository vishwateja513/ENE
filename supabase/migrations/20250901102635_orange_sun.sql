/*
  # Student CRM Initial Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `student_id` (text, unique)
      - `batch` (text)
      - `department` (text)
      - `phone` (text)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `coding_profiles`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `platform` (text) - leetcode, codeforces, codechef, gfg, hackerrank
      - `username` (text)
      - `profile_url` (text)
      - `last_synced` (timestamp)
      - `created_at` (timestamp)
    
    - `coding_stats`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key)
      - `problems_solved` (integer, default 0)
      - `contests_participated` (integer, default 0)
      - `rating` (integer, default 0)
      - `max_rating` (integer, default 0)
      - `rank` (text)
      - `easy_solved` (integer, default 0)
      - `medium_solved` (integer, default 0)
      - `hard_solved` (integer, default 0)
      - `acceptance_rate` (decimal, default 0)
      - `created_at` (timestamp)
    
    - `unified_scores`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `total_score` (decimal, default 0)
      - `leetcode_score` (decimal, default 0)
      - `codeforces_score` (decimal, default 0)
      - `codechef_score` (decimal, default 0)
      - `gfg_score` (decimal, default 0)
      - `hackerrank_score` (decimal, default 0)
      - `rank_position` (integer)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Students can read their own data
    - Admins can read/write all data
    - Public read access for leaderboards

  3. Indexes
    - Performance indexes on frequently queried columns
    - Composite indexes for complex queries
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  student_id text UNIQUE NOT NULL,
  batch text DEFAULT '',
  department text DEFAULT '',
  phone text DEFAULT '',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coding_profiles table
CREATE TABLE IF NOT EXISTS coding_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('leetcode', 'codeforces', 'codechef', 'gfg', 'hackerrank')),
  username text NOT NULL,
  profile_url text DEFAULT '',
  last_synced timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, platform)
);

-- Create coding_stats table
CREATE TABLE IF NOT EXISTS coding_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES coding_profiles(id) ON DELETE CASCADE,
  problems_solved integer DEFAULT 0,
  contests_participated integer DEFAULT 0,
  rating integer DEFAULT 0,
  max_rating integer DEFAULT 0,
  rank text DEFAULT '',
  easy_solved integer DEFAULT 0,
  medium_solved integer DEFAULT 0,
  hard_solved integer DEFAULT 0,
  acceptance_rate decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create unified_scores table
CREATE TABLE IF NOT EXISTS unified_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  total_score decimal(10,2) DEFAULT 0,
  leetcode_score decimal(10,2) DEFAULT 0,
  codeforces_score decimal(10,2) DEFAULT 0,
  codechef_score decimal(10,2) DEFAULT 0,
  gfg_score decimal(10,2) DEFAULT 0,
  hackerrank_score decimal(10,2) DEFAULT 0,
  rank_position integer,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id)
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coding_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_scores ENABLE ROW LEVEL SECURITY;

-- Students can read their own data
CREATE POLICY "Students can read own data"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Students can update their own data
CREATE POLICY "Students can update own data"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admins can read all student data
CREATE POLICY "Admins can read all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update all student data
CREATE POLICY "Admins can update all students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Students can manage their own coding profiles
CREATE POLICY "Students can manage own profiles"
  ON coding_profiles
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid());

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all profiles"
  ON coding_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Public read access for leaderboards
CREATE POLICY "Public read access for leaderboards"
  ON unified_scores
  FOR SELECT
  TO authenticated
  USING (true);

-- Students can read their own stats
CREATE POLICY "Students can read own stats"
  ON coding_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coding_profiles cp
      WHERE cp.id = profile_id AND cp.student_id = auth.uid()
    )
  );

-- Admins can read all stats
CREATE POLICY "Admins can read all stats"
  ON coding_stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_coding_profiles_student_platform ON coding_profiles(student_id, platform);
CREATE INDEX IF NOT EXISTS idx_coding_stats_profile_id ON coding_stats(profile_id);
CREATE INDEX IF NOT EXISTS idx_unified_scores_total_score ON unified_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_unified_scores_student_id ON unified_scores(student_id);

-- Create function to update student updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for students table
CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for unified_scores table
CREATE TRIGGER update_unified_scores_updated_at 
    BEFORE UPDATE ON unified_scores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();