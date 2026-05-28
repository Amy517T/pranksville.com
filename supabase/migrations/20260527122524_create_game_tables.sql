/*
  # Create Haunted Mansion Game Tables

  1. New Tables
    - `game_sessions`
      - `id` (uuid, primary key)
      - `user_name` (text, player name)
      - `current_level` (integer, which mansion level they're on, 1-5)
      - `current_room` (text, which room they're currently in)
      - `sanity` (integer, sanity meter 0-100)
      - `keys_found` (integer, number of keys collected)
      - `pranks_triggered` (text[], array of prank IDs triggered)
      - `rooms_visited` (text[], array of room IDs visited)
      - `completed` (boolean, whether the game is finished)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `leaderboard`
      - `id` (uuid, primary key)
      - `user_name` (text, player name)
      - `levels_completed` (integer, how many levels beaten)
      - `sanity_remaining` (integer, sanity left at completion)
      - `time_seconds` (integer, total time to complete)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Allow public read/write for game sessions (game is client-driven)
    - Allow public read for leaderboard, insert for authenticated
*/

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL DEFAULT 'Anonymous',
  current_level integer NOT NULL DEFAULT 1,
  current_room text NOT NULL DEFAULT 'foyer',
  sanity integer NOT NULL DEFAULT 100,
  keys_found integer NOT NULL DEFAULT 0,
  pranks_triggered text[] NOT NULL DEFAULT '{}',
  rooms_visited text[] NOT NULL DEFAULT '{"foyer"}',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL DEFAULT 'Anonymous',
  levels_completed integer NOT NULL DEFAULT 0,
  sanity_remaining integer NOT NULL DEFAULT 0,
  time_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on game_sessions"
  ON game_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on game_sessions"
  ON game_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update on game_sessions"
  ON game_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read on leaderboard"
  ON leaderboard FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert on leaderboard"
  ON leaderboard FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
