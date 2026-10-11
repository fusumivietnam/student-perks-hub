# Database backup and recovery

Last verified: 2026-10-11

Student Perks Hub currently runs the Production Supabase project on the organization Free plan. The Free plan does not provide the managed daily-backup retention used by paid Supabase plans, so the baseline recovery model uses encrypted logical backups plus versioned migrations and an explicit managed-state recovery guard.

## Current Production state

At the 2026-10-11 verification point:

- `auth.users`: 0 rows;
- `storage.objects`: 0 rows;
- application user-data tables (`profiles`, `bookmarks`, `submissions`, `student_verifications`): 0 rows;
- Production Supabase security advisor: no findings;
- the reviewed seed contains the public categories/offers used for launch verification.

This remains the safest window to strengthen recovery controls before managed Auth/Storage state accumulates.

## Recovery objectives

Initial launch targets:

- **RPO:** no more than 24 hours for application database data while the scheduled encrypted backup remains enabled and healthy;
- **RTO:** 4 hours for a database-only recovery decision, target provisioning, migration replay, data restore, and smoke verification.

These are operational targets, not contractual SLAs. Re-measure them after a real remote restore rehearsal and whenever dataset size or platform topology changes materially.

## Backup layers

### 1. Versioned schema and migration history

The repository is the source of truth for application schema evolution:

- `supabase/schemas/` — desired schema;
- `supabase/migrations/` — ordered migration history;
- pgTAP/RLS tests — authorization invariants;
- generated TypeScript database types — application/schema contract.

A clean target is rebuilt from these reviewed migrations before application data is restored.

### 2. Encrypted logical application backup

`.github/workflows/database-backup.yml` uses `scripts/database-backup.sh` to create:

- custom roles export;
- application schema export;
- application data export;
- `supabase_migrations` schema and data;
- a manifest with creation time and backup format.

Raw SQL exists only in the ephemeral runner temporary directory. The workflow archives it, encrypts the archive using AES-256-CBC with PBKDF2, verifies a SHA-256 checksum, and uploads only the encrypted archive and checksum. Raw SQL is deleted in an `always()` cleanup step.

Encrypted GitHub artifacts are retained for 30 days. Scheduled backups are gated by repository variable `DATABASE_BACKUP_ENABLED=true`; this was enabled only after a protected manual backup succeeded.

Required protected Production secrets:

- `SUPABASE_DB_URL` — database connection string with only the privileges required by backup/recovery checks;
- `BACKUP_ENCRYPTION_PASSPHRASE` — high-entropy encryption passphrase stored outside repository files and logs.

The passphrase must not be stored in the same artifact as the encrypted backup.

## Supabase-managed state boundary

Supabase CLI logical dumps intentionally treat platform-managed schemas specially. This backup baseline must therefore not be described as a complete replacement for Supabase platform backups.

In particular:

- Supabase Auth lives in the managed `auth` schema and can contain PII and password hashes;
- Storage database rows are metadata; Storage object bytes require a separate object backup/export strategy;
- database backup/restore does not recreate Auth provider configuration, API keys, SMTP settings, Edge Functions, Realtime settings, custom domains, or other provider configuration;
- restoring database state does not restore Storage object bytes deleted after a database backup.

Supabase managed physical backup / restore-to-new-project flows can preserve Auth database state, but Storage object bytes and several provider settings still require separate handling. PITR is a paid add-on and is not enabled automatically by this repository.

## Managed-state recovery watch

`.github/workflows/managed-state-recovery-watch.yml` runs daily and on manual dispatch using the protected Production database URL. It reads only two aggregate counts:

- `count(*)` from `auth.users`;
- `count(*)` from `storage.objects`.

No Auth rows, emails, Storage object paths, tokens, database URLs, or credentials are copied into issues or workflow summaries.

The watch is healthy when either:

1. both counts are zero; or
2. repository variable `MANAGED_STATE_RECOVERY_READY=true` has been deliberately set after a reviewed managed-state recovery strategy is implemented and rehearsed.

If either managed-state count becomes non-zero while the readiness variable is not true, the workflow fails and opens or updates one operational GitHub issue. This is an operational guard, not a substitute for a backup.

### Criteria before setting `MANAGED_STATE_RECOVERY_READY=true`

Set the variable only after one of these paths has evidence:

**Path A — managed recovery**

- a Supabase paid backup/PITR configuration meets the chosen RPO/RTO;
- a non-Production restore or restore-to-new-project rehearsal has been completed;
- Auth users survive the rehearsal as expected;
- Storage object bytes are covered by a separately tested backup/restore path;
- Auth provider configuration, SMTP, keys, redirects, Edge Functions and other non-database settings have a documented rebuild checklist.

**Path B — separately rehearsed encrypted recovery**

- Auth database state export/import is implemented using a reviewed provider-supported method and tested on a non-Production target;
- Storage metadata and object bytes are backed up separately and restored successfully;
- secrets and PII remain encrypted and access-controlled throughout the process;
- users can authenticate after recovery, or any forced re-authentication behavior is documented and accepted;
- non-database provider configuration has a tested rebuild checklist.

Do not set the variable merely because the database backup workflow is green.

## Restore model

For application schema/data recovery:

1. declare an incident and stop risky writes/deployments if data integrity is uncertain;
2. identify the exact release SHA, database migration state, and backup artifact timestamp;
3. provision/select a **non-Production recovery target** first;
4. replay the repository migrations into a clean target;
5. decrypt the selected backup only in an approved ephemeral/private execution environment;
6. restore application data in one transaction with `ON_ERROR_STOP=1`;
7. reconcile migration history if restoring to a newly provisioned project;
8. run schema/RLS tests and application smoke checks;
9. verify counts and representative records without copying sensitive values into issues/logs;
10. separately verify Auth, Storage object bytes, and provider configuration when managed state exists;
11. only after review, choose whether to promote the recovered target, restore Production, or perform a forward repair.

Never run `supabase db reset --linked` against Production.

## Safe local restore rehearsal

`.github/workflows/database-recovery-rehearsal.yml` exercises the application-database mechanism without Production data:

1. start local Supabase;
2. apply repository migrations and deterministic seed;
3. record representative category/offer counts;
4. create an encrypted backup with the same backup script;
5. decrypt only inside the ephemeral GitHub runner;
6. rebuild a clean local target from migrations with no seed;
7. restore the backed-up data;
8. verify the same representative counts;
9. run the database/RLS test suite;
10. remove decrypted material and stop local Supabase.

The rehearsal intentionally does not copy Production PII into CI and does not, by itself, prove Auth or Storage object-byte recovery.

## Destructive migrations

A destructive or coordinated migration must not rely on application rollback alone. Before approval it must record:

- affected tables/data;
- the newest verified backup identifier and age;
- whether managed Auth/Storage state is implicated;
- restore/forward-fix strategy;
- expected RPO/RTO impact;
- owner for the recovery decision.

The protected release workflow already fails closed for automatic application of non-backward-compatible migration classes.

## Owners and evidence

Database recovery owner: Production/repository maintainers, with a human reviewer required for restore or destructive-migration decisions.

Recovery evidence should contain only:

- workflow run/artifact identifier;
- timestamp;
- encrypted artifact checksum;
- aggregate validation counts where safe;
- schema/data smoke results;
- measured rehearsal duration;
- release/migration identity;
- managed-state recovery path and rehearsal identity when applicable.

Do not paste database URLs, backup passphrases, Auth rows, user emails, Storage object paths, tokens, raw SQL dumps, or other sensitive data into GitHub issues.
