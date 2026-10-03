# ADR-0001 — Production hosting and deployment topology

Status: **Accepted, amended by ADR-0002 for Preview**  
Date: 2026-10-02  
Decision issue: #42

> ADR-0002 replaces the requirement for a continuously managed Supabase Preview project during the initial MVP/beta phase. Vercel remains the application host, Supabase remains the Production backend, and GitHub Actions remains the release/migration control plane.

## Decision

Use:

- **Vercel** for the Next.js application hosting layer.
- **Supabase managed project** for Production PostgreSQL, Auth, API, and related backend services.
- **GitHub Actions local Supabase** as the authoritative PR/Preview validation environment during MVP/beta.
- **GitHub Actions** remains the source of truth for repository quality gates, release orchestration, migration gating, and release evidence.

A dedicated managed Preview Supabase project is optional and may be added later when persistent remote staging is justified. See ADR-0002.

## Why this topology

### Next.js fit

The application uses Next.js App Router, Server Components, Server Actions, route handlers, SSR, and production builds. Vercel is the lowest-friction deployment target for this stack and provides immutable deployments, Preview Deployments, environment-scoped variables, and rapid rollback to prior deployments.

### Environment isolation

Preview must never receive Production privileged credentials or use Production as a writable staging database.

During MVP/beta, database/auth Preview validation is performed with disposable local Supabase in GitHub Actions. Optional Vercel Preview deployments are UI/build review surfaces only until a dedicated remote Preview backend is introduced.

### Release traceability

The release identity is the exact reviewed Git commit SHA.

```text
release tag
  → Git commit SHA
  → CI Gate + CodeQL result
  → migration state
  → Vercel deployment
  → monitoring/release identity
```

### Rollback

Application rollback uses a previously known-good immutable Vercel deployment.

Database rollback is handled separately according to migration classification and the backup/restore runbook. Application rollback must never assume a destructive database migration can simply be reversed.

## Logical topology

```text
Developer / Codespaces
        │
        └── local Supabase CLI / Docker

GitHub Pull Request
        │
        ├── CI Gate / CodeQL
        ├── local Supabase migrations / RLS / Auth / E2E
        └── optional Vercel Preview
              └── no Production Supabase privileged credentials

main / reviewed release candidate
        │
        ├── CI Gate + CodeQL
        ├── protected Production migration gate
        └── Vercel Production deployment
                  │
                  └── Supabase Production project
                       - production data
                       - production Auth
                       - protected migration credentials
                       - backup / restore policy
```

## Application environments

### Local

- Next.js runs locally.
- Supabase CLI/Docker remains the source of truth for local development.
- No remote Supabase dependency is required.
- No Production credentials are permitted.

### Preview

- GitHub Actions local Supabase is the authoritative data/auth validation environment.
- Vercel Preview may be used for UI/build review.
- Preview must not receive Production service-role, migration, database-password, or deployment credentials.
- A managed Preview Supabase project is not required before first launch.

### Production

- Vercel Production Deployment.
- Production-scoped environment variables only.
- Uses one dedicated Supabase Production project.
- Production deployment requires repository release gates to pass.
- Production migration credentials are available only to the protected migration/deployment path.
- Only one Production release/migration lane may execute at a time.

## Environment variables

### Production application

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- optional `SUPABASE_INTERNAL_URL`

Migration credentials and any service-role credentials remain outside the repository and are scoped to the protected release mechanism using least privilege.

## Git and promotion model

```text
feature branch
  → PR
  → GitHub quality gates + disposable local Supabase
  → optional Vercel Preview UI/build review
  → merge to main
  → immutable candidate SHA
  → protected Production database migration gate
  → Vercel Production deployment
  → smoke checks
  → release evidence
```

A release must deploy an exact reviewed commit SHA.

## Production deployment control

Before public promotion:

1. CI Gate and CodeQL pass for the exact commit.
2. Migration classification is complete.
3. Backup/recovery readiness is confirmed.
4. The Production concurrency lane is free.
5. Production migrations are dry-run and then applied by the protected mechanism when allowed.
6. The exact reviewed application artifact is deployed.
7. Smoke checks pass.
8. Monitoring identifies the release SHA.
9. Release evidence is attached to #21.

## Deployment concurrency

Production application promotion and database migration use one logical concurrency lane. Overlapping Production releases are not allowed.

## Supabase deployment model

- Declarative schemas and versioned migrations remain in the repository.
- Local validation remains authoritative before merge.
- Production migrations are applied only after the Production gate.
- Destructive migrations require explicit recovery planning.
- Expand-and-contract migrations are preferred.
- A managed Preview project may be introduced later without changing the local-first schema/migration model.

## Deployment protection

For Vercel:

- Preview deployments must not expose Production privileged secrets.
- Production custom domain remains public.
- Production variables are scoped to Production.

## Rollback model

### Application

Use Vercel deployment history to restore the last known-good immutable deployment.

### Database

Use a reviewed forward fix or verified backup/restore path according to migration type. Do not blindly reverse destructive migrations.

## Observability

#44 must configure monitoring so errors and alerts include environment, commit SHA / release identity, and deployment identifier when available.

## Backup and recovery

#45 must document and test the Production Supabase backup/restore procedure, including realistic RPO/RTO expectations for the selected plan.

## Rejected alternatives

### Cloudflare Workers

Cloudflare supports modern Next.js deployment paths and strong preview/rollback capabilities, but it introduces an additional runtime compatibility layer without a clear MVP benefit.

### Netlify

Netlify is viable for Next.js, but does not offer a stronger advantage than the native Vercel path for this repository.

### Self-hosted application or Supabase

Self-hosting increases operational ownership for networking, patching, availability, backups, scaling, and incident response. It is not justified for the first production release.

## Consequences

This decision, together with ADR-0002, unblocks:

- #46 protected Production environment;
- #44 production observability and alert routing;
- #45 backup/restore verification;
- #21 first-production release rehearsal and launch.

The decision does **not** mean Production is ready. Resource provisioning, protected secrets, monitoring, backup/recovery, and release evidence are still required.
