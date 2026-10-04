#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL is required}"
: "${BACKUP_ENCRYPTION_PASSPHRASE:?BACKUP_ENCRYPTION_PASSPHRASE is required}"

output_dir="${1:-backup-output}"
work_dir="$(mktemp -d)"
archive="${output_dir}/student-perks-production-$(date -u +%Y%m%dT%H%M%SZ).tar.gz.enc"

cleanup() {
  rm -rf "${work_dir}"
}
trap cleanup EXIT

mkdir -p "${output_dir}"

pnpm exec supabase db dump --db-url "${SUPABASE_DB_URL}" --role-only -f "${work_dir}/roles.sql"
pnpm exec supabase db dump --db-url "${SUPABASE_DB_URL}" -f "${work_dir}/schema.sql"
pnpm exec supabase db dump --db-url "${SUPABASE_DB_URL}" --data-only --use-copy \
  -x "storage.buckets_vectors" \
  -x "storage.vector_indexes" \
  -f "${work_dir}/data.sql"
pnpm exec supabase db dump --db-url "${SUPABASE_DB_URL}" --schema supabase_migrations -f "${work_dir}/history_schema.sql"
pnpm exec supabase db dump --db-url "${SUPABASE_DB_URL}" --schema supabase_migrations --data-only --use-copy -f "${work_dir}/history_data.sql"

cat > "${work_dir}/manifest.txt" <<EOF
created_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
format=logical-supabase-cli-v1
contents=roles.sql,schema.sql,data.sql,history_schema.sql,history_data.sql
EOF

tar -C "${work_dir}" -czf - \
  roles.sql schema.sql data.sql history_schema.sql history_data.sql manifest.txt |
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 200000 \
    -pass env:BACKUP_ENCRYPTION_PASSPHRASE \
    -out "${archive}"

sha256sum "${archive}" > "${archive}.sha256"
chmod 600 "${archive}" "${archive}.sha256"

printf '%s\n' "${archive}"
