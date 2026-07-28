#!/usr/bin/env bash
# setup_game.sh — one-time setup for the Pranksville horror game.
# Installs dependencies, verifies the environment, and builds the project.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

log()  { printf '\033[1;34m[setup]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m  ✓\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m  ✗\033[0m %s\n' "$*" >&2; }

# --- Node ---------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  fail "Node.js is not installed. Install Node 18+ from https://nodejs.org and re-run."
  exit 1
fi
NODE_VERSION="$(node -v | sed 's/^v//')"
log "Node.js $NODE_VERSION detected"
ok "Node.js available"

if ! command -v npm >/dev/null 2>&1; then
  fail "npm is not installed. It ships with Node.js — reinstall Node from https://nodejs.org."
  exit 1
fi
ok "npm available"

# --- Environment --------------------------------------------------------
log "Checking environment configuration..."
if [ ! -f ".env" ]; then
  fail ".env file is missing. Create it with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  exit 1
fi
ok ".env found"

if ! grep -q "VITE_SUPABASE_URL" .env; then
  fail "VITE_SUPABASE_URL is missing from .env"
  exit 1
fi
if ! grep -q "VITE_SUPABASE_ANON_KEY" .env; then
  fail "VITE_SUPABASE_ANON_KEY is missing from .env"
  exit 1
fi
ok "Supabase credentials present"

# --- Dependencies -------------------------------------------------------
log "Installing dependencies..."
npm install
ok "Dependencies installed"

# --- Type check ---------------------------------------------------------
log "Running type check..."
if npm run typecheck; then
  ok "Type check passed"
else
  fail "Type check failed. Fix the errors above before continuing."
  exit 1
fi

# --- Build --------------------------------------------------------------
log "Building the project..."
if npm run build; then
  ok "Build succeeded"
else
  fail "Build failed. See the errors above."
  exit 1
fi

# --- Done ---------------------------------------------------------------
log "Setup complete."
printf '\n'
printf '  Next steps:\n'
printf '    - Run the dev server with:  npm run dev\n'
printf '    - Or preview the build:     npm run preview\n'
printf '\n'
