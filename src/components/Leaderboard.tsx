import { useEffect, useState } from 'react';
import { X, Trophy, Timer, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../i18n';
import { useMouseParallax } from '../hooks/useMouseParallax';

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
  const t = useT();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { rotX, rotY, containerRef } = useMouseParallax(2);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 perspective-2000">
      <div
        ref={containerRef}
        className="relative max-w-xl w-full mx-4 p-6 rounded-lg border border-amber-600/20 animate-card-flip-3d preserve-3d"
        style={{
          background: '#0a0a05',
          boxShadow: '0 0 60px rgba(200,170,0,0.1), 0 20px 60px rgba(0,0,0,0.8)',
          transform: `perspective(2000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <button
          onClick={onClose}
          className="btn-3d absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3
          className="text-xl font-bold mb-6 tracking-wider flex items-center gap-2 text-amber-500"
          style={{
            fontFamily: 'Georgia, serif',
            textShadow: '0 0 20px rgba(200,170,0,0.3)',
            transform: 'translateZ(25px)',
          }}
        >
          <Trophy className="w-5 h-5" />
          {t.leaderboard}
        </h3>

        {loading ? (
          <div className="text-center py-8 text-amber-600/40 text-sm animate-pulse">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-amber-600/40 text-sm" style={{ transform: 'translateZ(10px)' }}>
            {t.noSurvivors}
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto" style={{ transformStyle: 'preserve-3d' }}>
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-3 py-2 rounded border"
                style={{
                  borderColor: index < 3 ? 'rgba(200,170,0,0.3)' : 'rgba(200,170,0,0.1)',
                  background: index < 3 ? 'rgba(200,170,0,0.05)' : 'transparent',
                  boxShadow: index < 3 ? '0 4px 15px rgba(0,0,0,0.4), 0 0 10px rgba(200,170,0,0.08)' : '0 2px 8px rgba(0,0,0,0.3)',
                  transform: `translateZ(${index < 3 ? 15 : 5}px)`,
                  animation: `fadeUp3d 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.03}s both`,
                }}
              >
                <span
                  className="w-6 text-center font-bold"
                  style={{
                    color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'rgba(200,170,0,0.6)',
                    textShadow: index < 3 ? `0 0 8px ${index === 0 ? 'rgba(255,215,0,0.4)' : index === 1 ? 'rgba(192,192,192,0.4)' : 'rgba(205,127,50,0.4)'}` : 'none',
                  }}
                >
                  {index + 1}
                </span>
                <span className="flex-1 text-amber-500/80 text-sm truncate">{entry.user_name}</span>
                <span className="text-amber-600/50 text-xs flex items-center gap-1">
                  {entry.levels_completed}/5 {t.levels}
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
