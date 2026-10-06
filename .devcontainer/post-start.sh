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
  echo "==> Preparing local Supabase environment"
  if ! pnpm local:start; then
    echo "::warning::Local Supabase environment did not initialize automatically; run 'pnpm local:start' manually."
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
