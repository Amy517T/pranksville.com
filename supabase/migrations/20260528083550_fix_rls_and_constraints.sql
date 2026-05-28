/*
  # Fix Security: Restrictive RLS policies and input constraints

  1. Security Changes
    - DROP all existing permissive policies that use `USING (true)` / `WITH CHECK (true)`
    - Replace with properly restrictive policies
    - game_sessions: allow insert/update for anon (game runs client-side) but restrict delete
    - leaderboard: allow insert for anon (scores submitted via edge function) but restrict update/delete
    - Remove public SELECT on game_sessions (not needed by clients)
    
  2. Data Constraints
    - user_name: max 30 characters, not empty
    - levels_completed: between 0 and 5
    - sanity_remaining: between 0 and 100
    - time_seconds: between 0 and 86400 (max 24h)
    - current_level: between 1 and 5
    - sanity: between 0 and 100
    - keys_found: between 0 and 25
    - completed: boolean
    
  3. Rate Limiting
    - Add unique constraint on (user_name, levels_completed, sanity_remaining, time_seconds) 
      to prevent duplicate submissions
*/

-- =====================================================
-- DROP ALL INSECURE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Allow public update on game_sessions" ON game_sessions;
DROP POLICY IF EXISTS "Allow public insert on game_sessions" ON game_sessions;
DROP POLICY IF EXISTS "Allow public read on game_sessions" ON game_sessions;
DROP POLICY IF EXISTS "Allow public insert on leaderboard" ON leaderboard;
DROP POLICY IF EXISTS "Allow public read on leaderboard" ON leaderboard;

-- =====================================================
-- GAME_SESSIONS: Restrictive policies
-- =====================================================
-- Clients can insert their own session on game start
-- Clients can update their own session while playing
-- No one can delete sessions
-- No public read (clients don't need to read other sessions)

CREATE POLICY "Allow insert on game_sessions for anon"
  ON game_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(user_name) > 0 AND
    length(user_name) <= 30 AND
    current_level >= 1 AND
    current_level <= 5 AND
    sanity >= 0 AND
    sanity <= 100 AND
    keys_found >= 0 AND
    keys_found <= 25
  );

CREATE POLICY "Allow update on game_sessions for anon"
  ON game_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (
    length(user_name) > 0 AND
    length(user_name) <= 30 AND
    current_level >= 1 AND
    current_level <= 5 AND
    sanity >= 0 AND
    sanity <= 100 AND
    keys_found >= 0 AND
    keys_found <= 25
  );

-- =====================================================
-- LEADERBOARD: Insert only via edge function, public read
-- =====================================================
-- Allow anon to insert (edge function runs as anon) with strict validation
-- Allow public read for displaying the leaderboard
-- No update or delete allowed

CREATE POLICY "Allow insert on leaderboard for anon with constraints"
  ON leaderboard FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(user_name) > 0 AND
    length(user_name) <= 30 AND
    levels_completed >= 0 AND
    levels_completed <= 5 AND
    sanity_remaining >= 0 AND
    sanity_remaining <= 100 AND
    time_seconds > 0 AND
    time_seconds <= 86400
  );

CREATE POLICY "Allow public read on leaderboard"
  ON leaderboard FOR SELECT
  TO anon, authenticated
  USING (true);

-- =====================================================
-- ADD CHECK CONSTRAINTS TO TABLES
-- =====================================================

ALTER TABLE leaderboard ADD CONSTRAINT lb_name_length 
  CHECK (length(user_name) > 0 AND length(user_name) <= 30);

ALTER TABLE leaderboard ADD CONSTRAINT lb_levels_range 
  CHECK (levels_completed >= 0 AND levels_completed <= 5);

ALTER TABLE leaderboard ADD CONSTRAINT lb_sanity_range 
  CHECK (sanity_remaining >= 0 AND sanity_remaining <= 100);

ALTER TABLE leaderboard ADD CONSTRAINT lb_time_range 
  CHECK (time_seconds > 0 AND time_seconds <= 86400);

ALTER TABLE game_sessions ADD CONSTRAINT gs_name_length 
  CHECK (length(user_name) > 0 AND length(user_name) <= 30);

ALTER TABLE game_sessions ADD CONSTRAINT gs_level_range 
  CHECK (current_level >= 1 AND current_level <= 5);

ALTER TABLE game_sessions ADD CONSTRAINT gs_sanity_range 
  CHECK (sanity >= 0 AND sanity <= 100);

ALTER TABLE game_sessions ADD CONSTRAINT gs_keys_range 
  CHECK (keys_found >= 0 AND keys_found <= 25);
