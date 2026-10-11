# Release and rollback runbook

This runbook is provider-neutral. Add provider-specific commands only after the hosting and remote Supabase projects are selected.

## Release identity

Every release must be traceable through one immutable identity:

```text
release/tag → commit SHA → CI/workflow result → database migration state → deployment → monitoring
```

Record the exact commit SHA before promotion. Production must not be deployed from an unrelated branch or an unreviewed rebuild.

For the current Vercel deployment, the canonical Production endpoint is `https://student-perks-hub-fusumivietnam.vercel.app`. The protected release smoke gate must prove that this alias and the immutable deployment URL report the same exact Git SHA and Vercel deployment ID through `/api/health` before a release is considered successful.

## Release gate

Before production deployment:

- CI Gate is successful for the release commit.
- CodeQL is successful.
- Database validation is successful when database-related files changed.
- Browser E2E, automated accessibility, and performance budgets are successful.
- Critical user flows have been exercised in Preview.
- Manual accessibility review has been recorded.
- Legal/privacy content is current.
- Environment variables and secrets are present in the target environment.
- Database backup / recovery capability has been confirmed.
- A rollback owner and rollback target are known.
- Monitoring and alert routing are operational.
- The production deployment concurrency lane is clear.

## Database change classification

Classify every production migration before release:

- **Backward compatible:** additive schema changes and safe policy additions.
- **Coordinated:** application and schema must be deployed in a specific order.
- **Destructive:** drops, irreversible rewrites, or transformations with data-loss risk.

Destructive migrations require explicit human review, a tested recovery plan, and a confirmed usable backup or forward-recovery path.

Prefer expand-and-contract changes:

1. add new schema;
2. deploy code compatible with old and new schema;
3. migrate data;
4. switch application reads/writes;
5. remove old schema only in a later release.

## Deployment concurrency

Only one production promotion may execute at a time.

The provider-specific deployment workflow must use a single production concurrency group or an equivalent platform lock. A newer deployment must not race an in-progress database migration or application promotion.

## Preview dress rehearsal

Before the first production release:

1. deploy the exact candidate commit to Preview;
2. apply migrations through the same class of mechanism intended for Production;
3. run Browser E2E / smoke coverage against Preview where practical;
4. trigger a controlled monitoring error and alert;
5. validate release identity is visible in monitoring;
6. exercise application rollback to a known-good Preview release;
7. complete the backup/restore rehearsal required by #45;
8. record evidence on #21.

## Production deployment

1. Identify the exact commit SHA and intended release tag.
2. Confirm Preview validation and dress-rehearsal evidence.
3. Confirm the production deployment lock/concurrency lane.
4. Confirm database backup/recovery readiness.
5. Apply reviewed database migrations using the production deployment mechanism.
6. Deploy the application from the same reviewed commit.
7. Verify the immutable deployment `/api/health` reports the exact release SHA and a valid `dpl_` deployment ID.
8. Verify canonical Production `/api/health` reports the same release SHA and deployment ID.
9. Exercise the critical smoke checks through the canonical Production endpoint.
10. Confirm monitoring receives the production release identity.
11. Retain the single `release-evidence.json` artifact containing deployment, canonical alias, migration, workflow, health, and smoke evidence.
12. Close the release only after smoke checks and alerting are healthy.

## Smoke checks

At minimum verify:

- home page loads;
- offers discovery loads;
- one published offer detail loads;
- login reaches the expected auth boundary;
- protected pages reject unauthenticated access;
- database-backed reads work;
- admin authorization denies non-admin access;
- immutable and canonical `/api/health` both return HTTP 200;
- immutable and canonical health payloads identify the same exact release SHA and deployment ID;
- monitoring identifies the deployed environment and release.

## Rollback

### Application-only regression

1. stop further promotion;
2. identify the last known-good immutable release;
3. redeploy that exact application commit;
4. verify `/api/health` and critical flows;
5. confirm monitoring shows recovery.

### Database regression

1. stop deployment and data-changing operations where appropriate;
2. do not blindly reverse a destructive migration;
3. determine whether application rollback remains schema-compatible;
4. restore from a verified backup or apply a reviewed forward-fix as appropriate;
5. verify data integrity and critical flows;
6. record the incident, release identity, data impact, and recovery decision.

## Release tags

Use immutable release tags only for production releases. Recommended format:

`vMAJOR.MINOR.PATCH`

For pre-1.0 delivery, use `v0.x.y` and reserve major-version changes for deliberate compatibility breaks.

The release record must include the tag, commit SHA, deployment target, migration state, verification evidence, and rollback target.
