# Managed Auth + Storage recovery rehearsal — implementation plan

Status: **P0 / BLOCKED** (last reviewed 2026-10-27). This is a prerequisite plan; it is not recovery evidence and cannot turn the managed-state watch green.

## Trigger and current signal

The Production managed-state guard reported **managed Auth state exists with no repository-enforced recovery rehearsal** on run 40419414658. Backup freshness was healthy. This is a recoverability coverage gap, not evidence of an outage. The guard in `.github/workflows/managed-state-recovery-watch.yml` **must continue to fail closed** while evidence is missing.

## Recovery scope and risks

| Resource | Must restore | Proving test | Risk |
| --- | --- | --- | --- |
| Application schema and data | migrations + encrypted logical archive | existing weekly local rehearsal | already exercised, not managed-state complete |
| Auth identities | provider-supported identity state or user re-enrollment | non-Production sign-in with expected identity and permissions | password/session handling, PII, identity mapping |
| Storage metadata | buckets, object identifiers and access policies | metadata inventory and RLS tests | broken references |
| Storage bytes | actual binary payload (not only `storage.objects`) | upload fixture, destroy fixture target, restore bytes, compare SHA-256 | bytes missing even when metadata exists |
| Provider settings | redirect URLs, SMTP, OAuth, MFA, JWT/key rotation, functions | reviewed rebuild checklist on isolated project | external provider access, secrets |

## Safe, staged rehearsal contract

1. **Owner selects recovery strategy.** Either paid provider-backed Auth backup/restore plus separately tested object bytes, or a provider-supported encrypted export/import and approved re-auth/re-enrollment policy. Both require human review of user experience and cost.
2. Provision an **isolated, disposable non-Production project/stack**. Never use Production URL or secrets in test jobs; default deny network access to Production.
3. Create synthetic Auth users via the provider API and synthetic Storage objects of different byte sizes/content types. Record only aggregate counts, fixture digests and test timestamps.
4. Run the selected backup/export on the test stack. Encrypt sensitive exports; do not upload raw Auth rows, password material, JWTs or object bytes to GitHub artifacts.
5. Destroy *only* the isolated test stack, recreate it and restore the artifacts. Explicitly compare stable identity semantics, login/re-auth expectations, authorization/RLS, object metadata and byte-for-byte SHA-256.
6. Record and validate **machine-verifiable, non-sensitive evidence**: workflow ID, exact commit, tested strategy/version, scope `auth` and `storage-bytes`, fixture counts, checks passed, timestamp, measured duration and digest of the encrypted evidence artifact.
7. Extend the Production watch **only after** reviewers approve this proof, with a fresh-evidence window, exact workflow identity and fail-closed handling for missing/expired/failed Auth or Storage evidence. Do not accept a repository variable or manually set status as recovery proof.
8. Rehearse configuration reconstruction, including OAuth/SMTP redirects and key rotation, and document the realistic RPO/RTO. Do not claim original database-only 4h RTO is valid for managed state without timing it.

## Exit criteria

- [ ] Owner-approved recovery strategy and incident response owner
- [ ] Safe isolated environment, scoped secrets and provider-supported export/restore mechanism
- [ ] Synthetic Auth restoration and post-recovery authentication evidence
- [ ] Storage byte restoration with SHA-256 equality and metadata/RLS validation
- [ ] Configuration reconstruction evidence
- [ ] Fresh, encrypted, non-sensitive GitHub evidence validated by a reviewed watch update
- [ ] Separate DR runbook, rollback path and Production impact review

**Until all are satisfied, P0 remains open and the recovery watch remains red by design.** Production backups continue independently. Avoid submitting real production user data to GitHub Actions or a local test fixture.

## Operator verification without secrets

- Backup run: https://github.com/fusumivietnam/student-perks-hub/actions/workflows/database-backup.yml
- Managed state watch: https://github.com/fusumivietnam/student-perks-hub/actions/workflows/managed-state-recovery-watch.yml
- Last failing run: https://github.com/fusumivietnam/student-perks-hub/actions/runs/40419414658
- Base recovery policy: [DATABASE_RECOVERY.md](DATABASE_RECOVERY.md)
