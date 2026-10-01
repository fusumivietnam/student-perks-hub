#!/usr/bin/env bash
set -euo pipefail

echo "==> Preparing Student Perks Hub development environment"

corepack enable
corepack prepare pnpm@12.8.1 --activate
pnpm install --frozen-lockfile

# Understand Anything is a development-only enhancement. Keep it non-blocking:
# a transient upstream/network failure must never make Codespaces enter recovery mode.
UA_COMMIT="b05cc3b20990afca537b4fc0a49b4d7fbdc65bb0"
UA_INSTALL_URL="https://raw.githubusercontent.com/Egonex-AI/Understand-Anything/${UA_COMMIT}/install.sh"

if [[ "${SKIP_UNDERSTAND_ANYTHING:-0}" != "1" ]]; then
  echo "==> Installing Understand Anything for Codex (pinned: ${UA_COMMIT})"
  if ! curl --fail --silent --show-error --location "${UA_INSTALL_URL}" | bash -s codex; then
    echo "::warning::Understand Anything installation failed. The Codespace remains usable; rerun .devcontainer/post-create.sh later."
  fi
else
  echo "==> Skipping Understand Anything because SKIP_UNDERSTAND_ANYTHING=1"
fi

echo "==> Environment ready"
