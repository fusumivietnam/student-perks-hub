# Production provisioning state

Last verified: 2026-10-04

This document records the provider-side state for issue #46 without storing privileged credentials.

## Supabase Production

- Project: `student-perks-production`
- Region: Singapore (`ap-southeast-1`)
- Status at verification: `ACTIVE_HEALTHY`
- Baseline migrations and reviewed seed data are applied.
- Admin helper hardening from PR #67 is applied.
- Supabase Security Advisor reports no findings after the hardening migration.

## Vercel Production

- Team scope: `fusumivietnam`
- Project: `student-perks-hub`
- Git source: `fusumivietnam/student-perks-hub`
- Production branch: `main`
- Framework: Next.js
- Node.js: 24.x
- Function region: Singapore (`sin1`)

Production-only application variables are configured in Vercel for the managed Supabase Production endpoint and canonical origin:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_INTERNAL_URL`

No Supabase service-role key or database password is configured in the Vercel application environment.

Preview deployments do not receive the Production-only Supabase variables. A Preview build of the reviewed `main` SHA was used only to verify Git/Vercel build compatibility and was deliberately not promoted because promotion does not rebuild an artifact with Production environment bindings.

## First Production smoke

The Git-triggered Production deployment for reviewed merge SHA `d629108eead51684b252a3dcca0a903600742732` reached `READY` in Singapore and passed functional smoke checks for:

- `/api/health`;
- `/` with Production Supabase category/offer data;
- `/offers/github-student-developer-pack` with Production Supabase offer data.

That smoke also exposed a configuration defect: canonical/Open Graph URLs used the local fallback because `NEXT_PUBLIC_SITE_URL` had not yet been configured. The Production variable is now configured; a fresh Production build is required to verify the corrected metadata before #46 can close.

## Remaining release evidence

Before #46 can close:

1. verify canonical/Open Graph, sitemap, and robots origins on a fresh Production build after `NEXT_PUBLIC_SITE_URL` configuration;
2. record the new exact commit SHA and deployment identity;
3. demonstrate rollback to a known-good immutable Production deployment;
4. keep privileged release/migration credentials outside repository files and Vercel application runtime.

The repository release control plane remains the source of truth for exact-SHA provenance, migration dry-run policy, serialized Production deployment, smoke checks, and release evidence.
