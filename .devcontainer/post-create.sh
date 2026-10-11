#!/usr/bin/env bash
set -euo pipefail

echo "==> Preparing Student Perks Hub development environment"

required_node="$(tr -d '[:space:]' < .nvmrc)"
current_node="$(node --version | sed 's/^v//')"

if [[ "${current_node}" != "${required_node}" ]]; then
  if [[ -s /usr/local/share/nvm/nvm.sh ]]; then
    # shellcheck disable=SC1091
    source /usr/local/share/nvm/nvm.sh
    nvm install "${required_node}"
    nvm alias default "${required_node}"
    nvm use "${required_node}"
  else
    echo "Node ${required_node} is required by .nvmrc; found ${current_node}, and nvm is unavailable."
    exit 1
  fi
fi

echo "==> Node $(node --version)"
corepack enable
corepack prepare pnpm@12.8.1 --activate
echo "==> pnpm $(pnpm --version)"
pnpm install --frozen-lockfile

# CocoIndex Code is a development-only semantic retrieval layer. Keep it isolated
# from the application dependency graph and non-blocking so an upstream/network
# failure can never put Codespaces into recovery mode.
COCOINDEX_CODE_VERSION="0.2.42"
COCOINDEX_HOME="${HOME}/.local/share/cocoindex-code"
COCOINDEX_VENV="${COCOINDEX_HOME}/venv"
COCOINDEX_BIN="${HOME}/.local/bin"
COCOINDEX_VERSION_FILE="${COCOINDEX_HOME}/student-perks-version"

if [[ "${SKIP_COCOINDEX_CODE:-0}" != "1" ]]; then
  echo "==> Installing CocoIndex Code ${COCOINDEX_CODE_VERSION} for semantic code retrieval"
  if (
    set -e
    mkdir -p "${COCOINDEX_HOME}" "${COCOINDEX_BIN}"

    installed_version=""
    if [[ -f "${COCOINDEX_VERSION_FILE}" ]]; then
      installed_version="$(cat "${COCOINDEX_VERSION_FILE}")"
    fi

    if [[ "${installed_version}" != "${COCOINDEX_CODE_VERSION}" || ! -x "${COCOINDEX_VENV}/bin/ccc" ]]; then
      rm -rf "${COCOINDEX_VENV}"
      python3 -m venv "${COCOINDEX_VENV}"
      "${COCOINDEX_VENV}/bin/python" -m pip install --disable-pip-version-check --upgrade pip
      "${COCOINDEX_VENV}/bin/python" -m pip install --disable-pip-version-check "cocoindex-code[full]==${COCOINDEX_CODE_VERSION}"
      printf '%s\n' "${COCOINDEX_CODE_VERSION}" > "${COCOINDEX_VERSION_FILE}"
    fi

    ln -sfn "${COCOINDEX_VENV}/bin/ccc" "${COCOINDEX_BIN}/ccc"
    ln -sfn "${COCOINDEX_VENV}/bin/cocoindex-code" "${COCOINDEX_BIN}/cocoindex-code"
  ); then
    echo "==> CocoIndex Code ready: ${COCOINDEX_BIN}/ccc"
  else
    echo "::warning::CocoIndex Code installation failed. The Codespace remains usable; rerun .devcontainer/post-create.sh later or set SKIP_COCOINDEX_CODE=1 to skip it."
  fi
else
  echo "==> Skipping CocoIndex Code because SKIP_COCOINDEX_CODE=1"
fi

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
