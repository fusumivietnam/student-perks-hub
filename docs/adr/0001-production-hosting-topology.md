# ADR-0001 — Production hosting and deployment topology

Status: **Accepted**  
Date: 2026-10-02  
Decision issue: #42

## Decision

Use:

- **Vercel** for the Next.js application hosting layer.
- **Supabase managed projects** for PostgreSQL, Auth, API, and related backend services.
- **Two separate Supabase projects**:
  - one dedicated **Preview/Staging** project;
  - one dedicated **Production** project.
- **GitHub Actions** remains the source of truth for repository quality gates, release orchestration, migration gating, and release evidence.

This keeps application hosting optimized for Next.js while preserving the repository's existing local-first Supabase workflow and PostgreSQL-first database model.

## Why this topology

### Next.js fit

The application uses Next.js App Router, Server Components, Server Actions, route handlers, SSR, and production builds. Vercel is the lowest-friction deployment target for this stack and provides immutable deployments, Preview Deployments, environment-scoped variables, protected previews, and rapid rollback to prior deployments.

### Environment isolation

Preview and Production must not share database credentials or production data.

The selected topology therefore uses two separate managed Supabase projects rather than pointing Vercel Preview deployments at the Production database.

Preview application deployments use only Preview Supabase credentials. Production deployments use only Production Supabase credentials.

### Release traceability

The release identity is the exact reviewed Git commit SHA.

The production record must link:

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
        ├── local Next.js
        └── local Supabase CLI / Docker

GitHub Pull Request
        │
        ├── CI Gate / CodeQL / DB validation / Browser E2E
        │
        └── Vercel Preview deployment
                  │
                  └── Supabase Preview project
                       - non-production data only
                       - separate API keys
                       - separate database
                       - separate Auth users

main / reviewed release candidate
        │
        ├── CI Gate + CodeQL
        ├── protected migration gate
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

- Vercel Preview Deployment.
- Preview-scoped environment variables only.
- Uses the dedicated Supabase Preview project.
- Vercel Deployment Protection should protect preview URLs.
- Preview must not receive Production service-role credentials, migration credentials, user/session data, or Production deployment permission.
- Preview is the dress-rehearsal environment for migration, smoke, monitoring, and rollback tests.

### Production

- Vercel Production Deployment.
- Production-scoped environment variables only.
- Uses the dedicated Supabase Production project.
- Production deployment requires the repository release gates to pass.
- Production migration credentials are available only to the protected migration/deployment path, not to application runtime code unless explicitly required.
- Only one Production release/migration lane may execute at a time.

## Environment variables

### Preview

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- optional `SUPABASE_INTERNAL_URL` only if required by the final runtime topology

All values resolve to Preview resources.

### Production

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- optional `SUPABASE_INTERNAL_URL`

All values resolve to Production resources.

Migration credentials and any service-role credentials remain outside the repository and are scoped to the deployment/migration mechanism using least privilege.

## Git and promotion model

The repository remains protected by pull-request review, CI Gate, and CodeQL.

Preferred promotion model:

```text
feature branch
  → PR
  → GitHub quality gates
  → Vercel Preview + Supabase Preview
  → review
  → merge to main
  → immutable candidate SHA
  → protected database migration gate
  → Vercel Production deployment
  → smoke checks
  → release evidence
```

A release must deploy an exact reviewed commit SHA. The deployment must not be rebuilt from an unrelated branch.

## Production deployment control

Vercel's Git integration may create builds automatically, but repository release policy remains authoritative.

Before public promotion:

1. CI Gate and CodeQL pass for the exact commit.
2. Migration classification is complete.
3. Backup/recovery readiness is confirmed.
4. The Production concurrency lane is free.
5. Production migrations are applied by the protected migration mechanism.
6. The exact reviewed application deployment is promoted/deployed.
7. Smoke checks pass.
8. Monitoring identifies the release SHA.
9. Release evidence is attached to #21.

## Deployment concurrency

Production application promotion and production migration must use a single logical concurrency lane.

Provider-specific automation added under #46 must prevent overlapping production releases or migrations.

## Supabase deployment model

- Declarative schemas and versioned migrations remain in the repository.
- Local validation remains authoritative before merge.
- Preview migrations are applied to the Preview project first.
- Production migrations are applied only after the production gate.
- Destructive migrations require explicit recovery planning.
- Expand-and-contract migrations are preferred.

Supabase Branching may be evaluated later for per-PR database isolation, but it is not required for the initial launch because the selected baseline uses a dedicated Preview project and a dedicated Production project.

## Deployment protection

For Vercel:

- Preview deployments should use Vercel Authentication / Deployment Protection.
- Production custom domain remains public.
- Environment variables are separated by Preview and Production scope.
- Production-only credentials must not be exposed to Preview.

## Rollback model

### Application

Use Vercel deployment history to promote/restore the last known-good immutable deployment.

### Database

Use a reviewed forward fix or verified backup/restore path according to migration type. Do not blindly reverse destructive migrations.

## Observability

#44 must configure monitoring so errors and alerts include:

- environment;
- commit SHA / release identity;
- deployment identifier when available.

The same release identity must be usable during rollback and incident review.

## Backup and recovery

#45 must document and test the Production Supabase backup/restore procedure, including RPO/RTO expectations for the selected plan.

## Rejected alternatives

### Cloudflare Workers

Cloudflare supports modern Next.js deployment paths and strong preview/rollback capabilities, but it introduces an additional runtime compatibility layer and provider-specific adaptation work. That adds migration and testing surface without providing a clear benefit for this MVP.

### Netlify

Netlify is viable for Next.js and preview deployments, but does not offer a sufficiently stronger advantage over the native Vercel path for this repository to justify choosing it.

### Self-hosted application or Supabase

Self-hosting would increase operational ownership for networking, patching, availability, backups, scaling, and incident response. It is not justified for the first production release.

## Consequences

This decision unblocks:

- #46 protected Preview and Production environments;
- #44 production observability and alert routing;
- #45 backup/restore verification;
- #21 first-production release rehearsal and launch.

The decision does **not** mean Production is ready. It only fixes the hosting/topology contract that the remaining infrastructure work must implement.
