#!/usr/bin/env sh
set -eu

is_turso_running() {
  lsof -iTCP:8080 -sTCP:LISTEN -n -P >/dev/null 2>&1
}

TURSO_PID=""

cleanup() {
  if [ -n "$TURSO_PID" ]; then
    kill "$TURSO_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

if is_turso_running; then
  echo "Turso already running on 127.0.0.1:8080"
else
  echo "Starting Turso on 127.0.0.1:8080..."
  npm run turso:dev &
  TURSO_PID=$!

  i=0
  while [ "$i" -lt 50 ]; do
    if is_turso_running; then
      break
    fi
    sleep 0.2
    i=$((i + 1))
  done

  if ! is_turso_running; then
    echo "Timed out waiting for Turso to start on 127.0.0.1:8080" >&2
    exit 1
  fi
fi

next dev
