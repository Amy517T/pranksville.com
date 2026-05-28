import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function sanitize(input: string, maxLength: number): string {
  // Strip HTML tags and dangerous characters
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[&<>"']/g, '')
    .trim()
    .slice(0, maxLength);
}

interface ScorePayload {
  user_name: string;
  levels_completed: number;
  sanity_remaining: number;
  time_seconds: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: ScorePayload = await req.json();

    // Validate required fields exist
    if (!body.user_name || typeof body.user_name !== 'string') {
      return new Response(JSON.stringify({ error: "Invalid user_name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize user_name — strip XSS vectors
    const userName = sanitize(body.user_name, 30);
    if (userName.length === 0) {
      return new Response(JSON.stringify({ error: "user_name cannot be empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate numeric ranges
    const levelsCompleted = Number(body.levels_completed);
    const sanityRemaining = Number(body.sanity_remaining);
    const timeSeconds = Number(body.time_seconds);

    if (!Number.isInteger(levelsCompleted) || levelsCompleted < 0 || levelsCompleted > 5) {
      return new Response(JSON.stringify({ error: "Invalid levels_completed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Number.isInteger(sanityRemaining) || sanityRemaining < 0 || sanityRemaining > 100) {
      return new Response(JSON.stringify({ error: "Invalid sanity_remaining" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Number.isInteger(timeSeconds) || timeSeconds <= 0 || timeSeconds > 86400) {
      return new Response(JSON.stringify({ error: "Invalid time_seconds" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side validation: winning requires all 5 levels, sanity > 0, reasonable time
    // A "win" score must be logically achievable
    if (levelsCompleted === 5) {
      // Minimum time to complete: at least 60 seconds (moving through 50 rooms)
      if (timeSeconds < 60) {
        return new Response(JSON.stringify({ error: "Score validation failed: time too short for completion" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Sanity must be positive if completed
      if (sanityRemaining <= 0) {
        return new Response(JSON.stringify({ error: "Score validation failed: sanity must be positive on completion" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Insert via service role to bypass RLS for validated data
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/leaderboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        user_name: userName,
        levels_completed: levelsCompleted,
        sanity_remaining: sanityRemaining,
        time_seconds: timeSeconds,
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("Insert failed:", errText);
      return new Response(JSON.stringify({ error: "Failed to save score" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
