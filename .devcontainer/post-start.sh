#!/usr/bin/env bash
set -u

echo "==> Starting development services"

# docker-in-docker can take a few seconds after a Codespace resume.
docker_ready=0
for _ in {1..15}; do
  if docker info >/dev/null 2>&1; then
    docker_ready=1
    break
  fi
  sleep 2
done

if [[ "${docker_ready}" == "1" ]]; then
  if ! pnpm exec supabase status >/dev/null 2>&1; then
    echo "==> Starting local Supabase"
    pnpm exec supabase start || echo "::warning::Supabase did not start automatically; run 'pnpm local:start' manually."
  else
    echo "==> Supabase is already running"
  fi
else
  echo "::warning::Docker is not ready; skipping automatic Supabase start."
fi

if pgrep -f "next dev" >/dev/null 2>&1; then
  echo "==> Next.js dev server is already running"
else
  echo "==> Starting Next.js dev server"
  nohup pnpm dev > /tmp/student-perks-next.log 2>&1 &
fi

# Never fail Codespace startup because a development service is temporarily unavailable.
exit 0
