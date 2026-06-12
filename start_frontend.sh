#!/usr/bin/env bash
# Start the React frontend
# Usage: ./start_frontend.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "================================================"
echo "  DocuLingua — Multilingual RAG Frontend"
echo "================================================"

if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js is required (v18+)." >&2; exit 1
fi

cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing npm packages…"
  npm install
fi

echo ""
echo "Starting frontend on http://localhost:3000"
echo ""

npm run dev
