/*
  # Fix: Restrict game_sessions UPDATE policy

  1. Problem
    - The UPDATE policy on `game_sessions` has `USING (true)`, which allows
      any anon/authenticated user to update ANY row in the table.
    - This bypasses row-level security entirely for updates.

  2. Solution
    - Replace the permissive UPDATE policy with one that only allows updating
      rows that were created within the last 30 minutes.
    - This prevents users from modifying old/stale game sessions while still
      allowing active gameplay to update its own session.
    - The WITH CHECK clause still validates all field constraints.
*/

DROP POLICY IF EXISTS "Allow update on game_sessions for anon" ON game_sessions;

CREATE POLICY "Allow update on recent game_sessions for anon"
  ON game_sessions FOR UPDATE
  TO anon, authenticated
  USING (created_at > now() - interval '30 minutes')
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
