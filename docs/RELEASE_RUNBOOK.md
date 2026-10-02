# Release and rollback runbook

This runbook is provider-neutral. Add provider-specific commands only after the hosting and remote Supabase projects are selected.

## Release gate

Before production deployment:

- CI Gate is successful for the release commit.
- CodeQL is successful.
- Database validation is successful when database-related files changed.
- Critical user flows have been exercised in Preview.
- Accessibility and performance regressions have been reviewed for user-facing changes.
- Legal/privacy content is current.
- Environment variables and secrets are present in the target environment.
- Database backup / recovery capability has been confirmed.
- A rollback owner and rollback target are known.

## Database change classification

Classify every production migration before release:

- **Backward compatible:** additive schema changes and safe policy additions.
- **Coordinated:** application and schema must be deployed in a specific order.
- **Destructive:** drops, irreversible rewrites, or transformations with data-loss risk.

Destructive migrations require explicit human review and a tested recovery plan.

Prefer expand-and-contract changes:

1. add new schema;
2. deploy code compatible with old and new schema;
3. migrate data;
4. remove old schema only in a later release.

## Deployment

1. Identify the exact commit SHA.
2. Confirm Preview validation.
3. Apply reviewed database migrations using the production deployment mechanism.
4. Deploy the application from the same reviewed commit.
5. Verify `/api/health`.
6. Exercise the critical smoke checks.
7. Record the release/tag and notable migration state.

## Smoke checks

At minimum verify:

- home page loads;
- offers discovery loads;
- one offer detail loads;
- login flow reaches the expected auth boundary;
- protected pages reject unauthenticated access;
- database-backed reads work;
- `/api/health` returns HTTP 200.

Add admin smoke checks only after admin authorization is complete.

## Rollback

Application-only regression:

1. stop further promotion;
2. redeploy the last known-good application commit;
3. verify `/api/health` and critical flows.

Database regression:

1. do not blindly reverse a destructive migration;
2. determine whether application rollback remains schema-compatible;
3. restore from backup or apply a reviewed forward-fix as appropriate;
4. record the incident and recovery decision.

## Release tags

Use immutable release tags only after the production deployment succeeds. Recommended format:

`vMAJOR.MINOR.PATCH`

For pre-1.0 delivery, use `v0.x.y` and reserve major-version changes for deliberate compatibility breaks.
