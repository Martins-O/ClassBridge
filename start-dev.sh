#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
FRONTEND_DIR="$ROOT_DIR/Frontend"
BACKEND_DIR="$ROOT_DIR/Backend"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "Frontend directory not found: $FRONTEND_DIR" >&2
  exit 1
fi

if [[ ! -d "$BACKEND_DIR" ]]; then
  echo "Backend directory not found: $BACKEND_DIR" >&2
  exit 1
fi

cleanup() {
  local exit_code=$?
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  exit "$exit_code"
}

trap cleanup INT TERM EXIT

ensure_dependencies() {
  local dir="$1"
  if [[ ! -d "$dir/node_modules" ]]; then
    echo "Installing dependencies in $dir"
    npm --prefix "$dir" install
  fi
}

ensure_dependencies "$BACKEND_DIR"
ensure_dependencies "$FRONTEND_DIR"

npm --prefix "$BACKEND_DIR" run dev &
BACKEND_PID=$!
print_started() {
  echo "$1 dev server started (PID $2)"
}
print_started "Backend" "$BACKEND_PID"

npm --prefix "$FRONTEND_DIR" run dev &
FRONTEND_PID=$!
print_started "Frontend" "$FRONTEND_PID"

wait -n
