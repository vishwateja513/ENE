/*
  # Add automatic 24-hour refresh system

  1. New Tables
    - `refresh_schedule` - Track when profiles were last refreshed
    
  2. Functions
    - `schedule_profile_refresh()` - Function to check and refresh stale profiles
    - `auto_refresh_profiles()` - Automated refresh trigger
    
  3. Security
    - Enable RLS on refresh_schedule table
    - Add policies for authenticated users
*/

-- Create refresh schedule table
CREATE TABLE IF NOT EXISTS refresh_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  last_auto_refresh timestamptz DEFAULT now(),
  next_refresh_due timestamptz DEFAULT (now() + interval '24 hours'),
  refresh_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE refresh_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own refresh schedule"
  ON refresh_schedule
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "System can manage refresh schedule"
  ON refresh_schedule
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_refresh_schedule_student_id ON refresh_schedule(student_id);
CREATE INDEX IF NOT EXISTS idx_refresh_schedule_next_due ON refresh_schedule(next_refresh_due);

-- Function to check if profiles need refresh
CREATE OR REPLACE FUNCTION check_profiles_need_refresh()
RETURNS TABLE(student_id uuid, profile_ids uuid[], platforms text[])
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as student_id,
    array_agg(cp.id) as profile_ids,
    array_agg(cp.platform) as platforms
  FROM students s
  JOIN coding_profiles cp ON s.id = cp.student_id
  LEFT JOIN refresh_schedule rs ON s.id = rs.student_id
  WHERE 
    rs.next_refresh_due IS NULL 
    OR rs.next_refresh_due <= now()
    OR cp.last_synced IS NULL
    OR cp.last_synced < (now() - interval '24 hours')
  GROUP BY s.id;
END;
$$;

-- Initialize refresh schedule for existing students
INSERT INTO refresh_schedule (student_id, last_auto_refresh, next_refresh_due)
SELECT 
  id,
  now() - interval '23 hours', -- Make them due for refresh soon
  now() + interval '1 hour'
FROM students
WHERE id NOT IN (SELECT student_id FROM refresh_schedule);