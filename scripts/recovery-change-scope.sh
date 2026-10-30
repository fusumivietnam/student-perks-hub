#!/usr/bin/env bash
set -euo pipefail

# Emit relevant=true when a PR changes recovery-owned surfaces or actually
# changes a Supabase dependency. Schedule/manual/non-PR runs always rehearse.
if [[ "${GITHUB_EVENT_NAME:-}" != "pull_request" ]]; then
  echo "relevant=true"
  exit 0
fi

base_sha="${BASE_SHA:-}"
head_sha="${HEAD_SHA:-}"

if [[ -z "${base_sha}" || -z "${head_sha}" ]]; then
  echo "relevant=true"
  exit 0
fi

changed_files="$(git diff --name-only "${base_sha}" "${head_sha}")"

if grep -Eq '^(scripts/(local-auth-identity-roundtrip|validate-managed-state-evidence(\\.test)?)\\.mjs$|supabase/|scripts/(database-backup\.sh|managed-state-recovery-rehearsal\.mjs|recovery-change-scope\.sh)$|\.github/workflows/(database-backup|database-recovery-rehearsal|managed-state-recovery-rehearsal)\.yml$)' <<< "${changed_files}"; then
  echo "relevant=true"
  exit 0
fi

if grep -Eq '^(package\.json|pnpm-lock\.yaml)$' <<< "${changed_files}"; then
  if git diff --unified=0 "${base_sha}" "${head_sha}" -- package.json pnpm-lock.yaml \
    | grep -Eq '^[+-].*("?@supabase/|"?supabase(@|"|:)|/supabase/)'; then
    echo "relevant=true"
    exit 0
  fi
fi

echo "relevant=false"
