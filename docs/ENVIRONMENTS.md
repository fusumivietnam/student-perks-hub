# Environment model

Student Perks Hub uses three logical environments. Provider-specific configuration may vary, but these responsibilities must stay separate.

| Environment | Purpose | Data | Deployment |
| --- | --- | --- | --- |
| Local | development and database iteration | disposable local Supabase | developer machine / Codespaces |
| Preview | pull-request verification and release rehearsal | isolated non-production Supabase | per-PR or shared preview |
| Production | public service | production Supabase | protected production deployment |

## Local

Local development is fully reproducible from the repository:

- `pnpm local:start`
- `pnpm db:reset`
- `pnpm db:test`
- `pnpm db:types`
- `pnpm dev`

Local development must never require production credentials.

## Preview

Preview must use non-production credentials, a non-production Supabase project, and non-production data.

Required configuration:

- `NEXT_PUBLIC_SITE_URL` — absolute public URL for canonical metadata, sitemap, and robots
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- optional `SUPABASE_INTERNAL_URL` when the hosting topology needs a private server-side endpoint

Preview must not:

- point to the Production database;
- reuse Production service-role credentials;
- receive copied production user/session data by default;
- have permission to promote or mutate Production resources.

Preview is the mandatory rehearsal target for migrations, application promotion, smoke checks, monitoring tests, and rollback before the first Production launch.

## Production

Production deployment requires:

1. CI Gate and CodeQL green on the exact commit.
2. Reviewed and classified database migrations.
3. A protected deployment environment.
4. Production secrets stored only in the deployment platform / GitHub Environment.
5. Restricted deployment permission.
6. A single production deployment concurrency lane.
7. A known-good rollback target.
8. Monitoring and alert routing enabled.
9. Backup/recovery capability confirmed.
10. Smoke checks after deployment.

`NEXT_PUBLIC_SITE_URL` must be set to the canonical production origin.

## Secret ownership

Never commit environment secrets. Public browser keys may be exposed only when they are explicitly designed to be public; service-role credentials remain server-only.

Production secrets must be isolated from Preview, rotated when exposure is suspected, and access must follow least privilege. Record suspected exposure in the incident process.

## Promotion model

Promote the same reviewed source commit through environments whenever the deployment platform supports it:

```text
PR commit
  → Preview
  → review / gates
  → merge to main
  → release candidate SHA
  → protected Production deployment
```

Do not rebuild from an unrelated branch for Production.

## Deployment identity

Every Preview and Production deployment should expose or record:

- environment;
- commit SHA;
- release/tag when applicable;
- deployment/workflow identifier;
- database migration state or migration identifier.

Monitoring and incident records should use the same identity so a production error can be correlated back to the exact release.

## Production isolation invariant

A Preview compromise or failure must not grant direct access to Production data, Production secrets, Production migration credentials, or Production deployment permission.
