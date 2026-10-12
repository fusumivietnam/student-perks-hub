# Database backup and recovery

Last verified: 2026-10-12

Student Perks Hub currently uses a cost-conscious Production recovery baseline: reviewed migrations + encrypted logical application backups + automated backup-freshness and managed-state guards. Paid Supabase PITR is not enabled.

## Current Production state

Verified directly against Production on 2026-10-12:

- `auth.users`: 0 rows;
- `storage.objects`: 0 rows;
- `profiles`: 0 rows;
- `bookmarks`: 0 rows;
- `submissions`: 0 rows;
- `student_verifications`: 0 rows.

Production therefore remains inside the safe pre-managed-state window. Do not set `MANAGED_STATE_RECOVERY_READY=true` merely because the application database backup lane is healthy.

Latest scheduled encrypted Production backup verified during this review:

- workflow: `Production Database Backup`;
- run: `38178728360`;
- exact repository SHA: `46dad9cac34d2a46d81a71a9330cf9f23b6e1b7b`;
- result: success.

## Recovery objectives

Current operational targets:

- **Application database RPO:** <=24 hours while the scheduled encrypted backup remains enabled and healthy;
- **Database-only RTO target:** 4 hours for incident decision, clean-target provisioning, migration replay, data restore, and verification.

These are operational targets rather than contractual SLAs. Re-measure them when dataset size/topology changes or after a remote restore rehearsal becomes justified.

## Recovery layers

### 1. Versioned schema and authorization contract

The repository remains source of truth for application database structure:

- `supabase/schemas/` — desired schema;
- `supabase/migrations/` — ordered migration history;
- database/pgTAP tests — RLS and authorization invariants;
- generated TypeScript database types — application/schema contract.

A clean recovery target is rebuilt from reviewed migrations before application data is restored.

### 2. Daily encrypted logical application backup

`.github/workflows/database-backup.yml` uses `scripts/database-backup.sh` to create the reviewed logical backup package. Raw SQL exists only in the ephemeral runner. The package is encrypted using AES-256-CBC with PBKDF2, integrity checked with SHA-256, and only the encrypted archive plus checksum are persisted.

The daily Production backup artifact intentionally remains on a **30-day rolling retention window**. This protects recent application database state without turning GitHub Actions artifacts into long-term archival storage.

Protected Production credentials required by this lane:

- `SUPABASE_DB_URL`;
- `BACKUP_ENCRYPTION_PASSPHRASE`.

Never store the passphrase beside the encrypted backup or print either credential in logs/issues.

### 3. Weekly recovery rehearsal

`.github/workflows/database-recovery-rehearsal.yml` exercises the same encrypted backup/restore mechanics against deterministic local Supabase state; it never copies Production data into CI and does not use Production secrets.

The rehearsal:

1. starts local Supabase;
2. applies reviewed migrations and deterministic seed data;
3. records safe representative category/offer counts;
4. creates and verifies an encrypted backup;
5. decrypts only inside the ephemeral runner;
6. rebuilds a clean target from migrations without seed data;
7. restores application data transactionally with `ON_ERROR_STOP=1`;
8. verifies representative counts;
9. runs the database/RLS authorization tests;
10. emits a structured recovery evidence artifact;
11. removes decrypted material and stops the local stack.

Structured evidence contains no Production PII, Auth rows, Storage paths, credentials, raw SQL, or backup passphrase. It records only workflow identity, exact commit SHA, measured rehearsal duration, safe aggregate counts, check results, and verification timestamp. This small evidence artifact is retained for **90 days**.

The rehearsal proves the application schema/data recovery mechanism. It does **not** prove Production Auth recovery or Storage object-byte recovery.

## Managed Supabase state boundary

Supabase-managed state requires separate treatment:

- Auth state lives in the managed `auth` schema and may contain PII and password hashes;
- Storage database rows are metadata, while object bytes require their own recovery path;
- database restore does not automatically recreate all provider configuration such as Auth providers, SMTP, API keys, redirects, Edge Functions, custom domains, or other project settings;
- restoring Storage metadata alone does not restore deleted object bytes.

Supabase managed backup/PITR or restore-to-new-project can become part of the strategy when managed state exists and the required RPO/RTO justifies paid infrastructure. Even then, Storage object bytes and non-database provider configuration must be explicitly covered and rehearsed.

## Managed-state recovery watch

`.github/workflows/managed-state-recovery-watch.yml` runs daily after the scheduled backup window. It reads only aggregate counts from:

- `auth.users`;
- `storage.objects`.

It also verifies that the newest successful encrypted database backup artifact is fresh, unexpired, and has an integrity digest.

The watch is healthy when:

1. Auth and Storage managed-state counts are both zero; or
2. `MANAGED_STATE_RECOVERY_READY=true` was deliberately set only after a reviewed managed recovery strategy was implemented and rehearsed.

If the boundary is exceeded, the workflow fails and opens/updates a GitHub operational issue without copying sensitive managed-state values.

### Criteria before `MANAGED_STATE_RECOVERY_READY=true`

Choose and prove one reviewed path.

**Managed recovery path**

- paid Supabase backup/PITR meets the selected RPO/RTO;
- a safe non-Production restore/restore-to-new-project rehearsal succeeds;
- Auth users survive as expected;
- Storage object bytes have a separate tested backup/restore path;
- Auth/provider/SMTP/key/redirect/function configuration has a rebuild checklist.

**Separately rehearsed recovery path**

- provider-supported Auth export/import is encrypted and tested against a non-Production target;
- Storage metadata and object bytes are separately backed up/restored;
- secrets/PII remain encrypted and access-controlled;
- post-recovery sign-in or forced re-authentication behavior is documented and accepted;
- non-database provider configuration has a tested rebuild checklist.

## Incident restore model

For application schema/data recovery:

1. declare the incident and stop risky writes/deployments if integrity is uncertain;
2. record the exact release SHA, deployment ID, migration state, and selected backup timestamp;
3. select/provision a **non-Production recovery target first**;
4. replay reviewed migrations into the clean target;
5. decrypt the selected backup only in an approved ephemeral/private environment;
6. restore application data transactionally with `ON_ERROR_STOP=1`;
7. reconcile migration history if recovering into a newly provisioned project;
8. run schema/RLS tests plus application smoke checks;
9. verify aggregate counts and representative records without leaking sensitive values;
10. separately verify Auth, Storage object bytes, and provider configuration when managed state exists;
11. only after review choose target promotion, Production restore, or forward repair.

Never run `supabase db reset --linked` against Production.

## Destructive/coordinated migrations

Before approval, record:

- affected tables/data;
- newest verified backup run/artifact and age;
- whether Auth/Storage state is implicated;
- restore/forward-fix strategy;
- expected RPO/RTO impact;
- recovery decision owner.

The protected release workflow fails closed for automatic application of non-backward-compatible migration classes.

## Evidence and ownership

Database recovery owner: Production/repository maintainers, with human review required for real restore or destructive-migration decisions.

Safe recovery evidence may contain:

- workflow run/artifact identifier;
- exact commit/release/migration identity;
- timestamp;
- encrypted artifact digest/checksum;
- safe aggregate validation counts;
- schema/data/RLS check results;
- measured rehearsal duration;
- managed-state recovery path/rehearsal identity when applicable.

Never copy database URLs, encryption passphrases, Auth rows, emails, Storage object paths, tokens, raw SQL dumps, session material, or other sensitive values into GitHub artifacts/issues beyond the encrypted backup artifact itself.
