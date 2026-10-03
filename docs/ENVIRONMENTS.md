# Environment model

Student Perks Hub uses three logical environments while keeping the initial managed-infrastructure footprint minimal.

| Environment | Purpose | Data | Deployment |
| --- | --- | --- | --- |
| Local | development and database iteration | disposable local Supabase | developer machine / Codespaces |
| Preview | pull-request validation and UI/build review | disposable local Supabase in CI; no Production data | GitHub Actions + optional Vercel Preview |
| Production | public service | dedicated managed Supabase Production | protected Vercel Production deployment |

## Local

Local development is fully reproducible from the repository:

- `pnpm local:start`
- `pnpm db:reset`
- `pnpm db:test`
- `pnpm db:types`
- `pnpm dev`

Local development must never require Production credentials.

## Preview

The authoritative Preview validation environment is GitHub Actions using the repository-managed local Supabase stack.

It validates:

- migrations and deterministic seed data;
- database authorization and RLS;
- Auth and PostgREST behavior;
- generated database types;
- production Next.js build;
- browser E2E;
- accessibility;
- Lighthouse performance budgets.

Vercel Preview deployments are optional UI/build review surfaces. Until a dedicated managed Preview backend is intentionally added, they are not considered full remote data/auth staging environments.

Preview must not:

- receive Production Supabase service-role or migration credentials;
- receive Production database passwords or access tokens;
- mutate Production data as a staging shortcut;
- have permission to promote or mutate Production resources.

A dedicated managed Preview Supabase project may be added later when persistent remote staging is justified by integrations, release frequency, or risk.

## Production

Production deployment requires:

1. CI Gate and CodeQL green on the exact commit.
2. Reviewed and classified database migrations.
3. A protected Production deployment environment.
4. Production secrets stored only in the deployment platform / protected environment.
5. Restricted deployment permission.
6. A single Production deployment concurrency lane.
7. A known-good application rollback target.
8. Monitoring and alert routing enabled.
9. Backup/recovery capability confirmed.
10. Smoke checks after deployment.

Production uses one dedicated managed Supabase project.

Required application configuration includes:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- optional `SUPABASE_INTERNAL_URL` when required by runtime topology

Migration credentials and any service-role credentials remain server-side and outside the repository.

## Secret ownership

Never commit environment secrets. Public browser keys may be exposed only when explicitly designed to be public; service-role credentials remain server-only.

Production secrets must not be copied into Preview. Rotate them when exposure is suspected and record suspected exposure through the incident process.

## Promotion model

```text
PR
  → local Supabase CI validation
  → optional Vercel Preview UI/build review
  → merge to main
  → exact release candidate SHA
  → protected Production migration gate
  → Vercel Production + Supabase Production
```

Do not rebuild from an unrelated branch for Production.

## Deployment identity

Every Production deployment must record:

- environment;
- commit SHA;
- release/tag when applicable;
- deployment/workflow identifier;
- database migration state or migration identifier.

Monitoring and incident records should use the same identity so an error can be correlated to the exact release.

## Production isolation invariant

A Preview compromise or failure must not grant direct access to Production data, Production secrets, Production migration credentials, or Production deployment permission.
