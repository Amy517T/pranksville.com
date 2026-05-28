import { useEffect, useState } from 'react';
import { X, Trophy, Timer, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  id: string;
  user_name: string;
  levels_completed: number;
  sanity_remaining: number;
  time_seconds: number;
  created_at: string;
}

interface LeaderboardProps {
  onClose: () => void;
}

function sanitizeDisplayName(name: string): string {
  return name
    .replace(/<[^>]*>/g, '')
    .replace(/[&<>"']/g, '')
    .trim()
    .slice(0, 30);
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('leaderboard')
      .select('id, user_name, levels_completed, sanity_remaining, time_seconds, created_at')
      .order('levels_completed', { ascending: false })
      .order('sanity_remaining', { ascending: false })
      .order('time_seconds', { ascending: true })
      .limit(20);

    if (data) {
      const sanitized = data.map(entry => ({
        ...entry,
        user_name: sanitizeDisplayName(entry.user_name),
      }));
      setEntries(sanitized);
    }
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <div className="relative max-w-xl w-full mx-4 p-6 rounded-lg border border-amber-600/20"
        style={{
          background: '#0a0a05',
          boxShadow: '0 0 60px rgba(200,170,0,0.1)',
        }}>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-6 tracking-wider flex items-center gap-2 text-amber-500"
          style={{ fontFamily: 'Georgia, serif' }}>
          <Trophy className="w-5 h-5" />
          Leaderboard
        </h3>

        {loading ? (
          <div className="text-center py-8 text-amber-600/40 text-sm">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-amber-600/40 text-sm">
            No survivors yet. Will you be the first?
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-3 py-2 rounded border border-amber-600/10"
                style={{
                  background: index < 3 ? 'rgba(200,170,0,0.05)' : 'transparent',
                }}
              >
                <span className="w-6 text-center font-bold text-amber-600/60">
                  {index + 1}
                </span>
                <span className="flex-1 text-amber-500/80 text-sm truncate">
                  {entry.user_name}
                </span>
                <span className="text-amber-600/50 text-xs flex items-center gap-1">
                  {entry.levels_completed}/5 levels
                </span>
                <span className="text-red-400/60 text-xs flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {entry.sanity_remaining}%
                </span>
                <span className="text-amber-600/40 text-xs flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {formatTime(entry.time_seconds)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export async function submitToLeaderboard(
  playerName: string,
  levelsCompleted: number,
  sanityRemaining: number,
  timeSeconds: number
): Promise<boolean> {
  // Client-side validation before sending to server
  const sanitized = sanitizeDisplayName(playerName);
  if (sanitized.length === 0) return false;
  if (!Number.isInteger(levelsCompleted) || levelsCompleted < 0 || levelsCompleted > 5) return false;
  if (!Number.isInteger(sanityRemaining) || sanityRemaining < 0 || sanityRemaining > 100) return false;
  if (!Number.isInteger(timeSeconds) || timeSeconds <= 0 || timeSeconds > 86400) return false;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/submit-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'Apikey': anonKey,
      },
      body: JSON.stringify({
        user_name: sanitized,
        levels_completed: levelsCompleted,
        sanity_remaining: sanityRemaining,
        time_seconds: timeSeconds,
      }),
    });

    if (!response.ok) {
      console.error('Score submission failed:', await response.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('Score submission error:', err);
    return false;
  }
}
