#!/usr/bin/env bash
# Start the FastAPI backend
# Usage: ./start_backend.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "================================================"
echo "  DocuLingua — Multilingual RAG Backend"
echo "================================================"

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 is required." >&2; exit 1
fi

# Create & activate venv
cd "$BACKEND_DIR"
if [ ! -d ".venv" ]; then
  echo "Creating virtual environment…"
  python3 -m venv .venv
fi
source .venv/bin/activate

echo "Installing dependencies…"
pip install -q -r ../requirements.txt

# Load .env if present
if [ -f .env ]; then
  echo "Loading .env …"
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$GOOGLE_API_KEY" ]; then
  echo ""
  echo "WARNING: GOOGLE_API_KEY is not set."
  echo "  Copy backend/.env.example → backend/.env and fill in your key."
  echo ""
fi

echo ""
echo "Starting server on http://localhost:8000"
echo "API docs at  http://localhost:8000/docs"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
