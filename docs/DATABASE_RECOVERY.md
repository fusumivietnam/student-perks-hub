# Database backup and recovery

Last verified: 2026-10-04

Student Perks Hub currently runs the Production Supabase project on the organization Free plan. The Free plan does not provide the managed daily-backup retention used by paid Supabase plans, so the initial recovery model uses encrypted logical backups plus versioned migrations.

## Current Production state

At the 2026-10-04 verification point:

- `auth.users`: 0 rows;
- `storage.objects`: 0 rows;
- application user-data tables (`profiles`, `bookmarks`, `submissions`): 0 rows;
- the reviewed seed contains the public categories/offers used for launch verification.

This makes the pre-user launch window the safest time to establish and rehearse recovery controls.

## Recovery objectives

Initial launch targets:

- **RPO:** no more than 24 hours for application database data once the scheduled backup is enabled;
- **RTO:** 4 hours for a database-only recovery decision, target provisioning, migration replay, data restore, and smoke verification.

These are operational targets, not contractual SLAs. Re-measure them after the first real remote restore rehearsal and whenever dataset size or platform topology changes materially.

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

Encrypted GitHub artifacts are retained for 30 days. The schedule is present but deliberately gated by repository variable `DATABASE_BACKUP_ENABLED=true`; this prevents noisy false assurance before protected credentials are configured and the first backup is verified.

Required protected Production secrets:

- `SUPABASE_DB_URL` — database connection string with only the privileges required to dump the Production database;
- `BACKUP_ENCRYPTION_PASSPHRASE` — high-entropy encryption passphrase stored outside repository files and logs.

The passphrase must not be stored in the same artifact as the encrypted backup.

## Supabase-managed state boundary

Supabase CLI logical dumps intentionally treat platform-managed schemas specially. This backup baseline must therefore not be described as a complete replacement for Supabase platform backups.

In particular:

- Supabase Auth lives in the managed `auth` schema and may contain PII/password hashes;
- Storage database rows are metadata; Storage object bytes require a separate object backup/export strategy;
- Auth provider settings, API keys, Edge Functions, Realtime settings and other project configuration are provider configuration, not ordinary application-table data.

Before Production has real Auth users or Storage objects, choose and verify one of these paths:

1. upgrade to a Supabase plan with managed database backups/PITR appropriate to the required RPO/RTO; or
2. extend the encrypted recovery procedure with a reviewed full Auth export/import and Storage object backup strategy, keeping PII encrypted and access-controlled.

Until that verification exists, a disaster involving managed Auth/Storage state may require user re-authentication or separate provider-specific recovery. This limitation is explicit rather than hidden.

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
10. only after review, choose whether to promote the recovered target, restore Production, or perform a forward repair.

Never run `supabase db reset --linked` against Production.

## Safe local restore rehearsal

`.github/workflows/database-recovery-rehearsal.yml` exercises the mechanism without Production data:

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

The rehearsal intentionally does not copy Production PII into CI.

## Destructive migrations

A destructive or coordinated migration must not rely on application rollback alone. Before approval it must record:

- affected tables/data;
- the newest verified backup identifier and age;
- whether managed Auth/Storage state is implicated;
- restore/forward-fix strategy;
- expected RPO/RTO impact;
- owner for the recovery decision.

The existing release workflow already fails closed for automatic application of non-backward-compatible migration classes.

## Owners and evidence

Database recovery owner: Production/repository maintainers, with a human reviewer required for restore or destructive-migration decisions.

Evidence belongs in #45 and the umbrella #21 issue and should contain only:

- workflow run/artifact identifier;
- timestamp;
- encrypted artifact checksum;
- schema/data smoke results;
- measured rehearsal duration;
- release/migration identity.

Do not paste database URLs, backup passphrases, Auth rows, user emails, tokens, raw SQL dumps, or other sensitive data into GitHub issues.
