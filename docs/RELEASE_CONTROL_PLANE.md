# Release control plane

GitHub Actions is the release control plane for the Vercel + Supabase topology in ADR-0001 as amended by ADR-0002.

## Scope

`.github/workflows/release.yml` is **Production-only**. Preview validation is handled by CI with disposable local Supabase; optional Vercel Preview deployments are not allowed to consume Production database or migration credentials.

The workflow accepts:

- exact 40-character commit SHA;
- whether Production migrations should be applied;
- migration class;
- dry-run mode.

A release SHA must be reachable from protected `main` and have successful `CI` and `CodeQL` runs for that exact SHA.

## Protected Production environment

Create one protected GitHub Environment named `production`.

Production secrets belong only there:

### Vercel

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Supabase

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

Do not store these values in repository files or expose them to Preview deployments.

## Concurrency

All Production release runs share one concurrency lane with `cancel-in-progress: false`, preventing overlapping migrations or deployments.

## Migration gate

The workflow performs `supabase db push --dry-run` before applying remote migrations.

Automatic application is allowed only for migrations classified as `backward-compatible`.

`coordinated` and `destructive` migrations fail closed and must follow the reviewed release/rollback runbook.

## Deployment provenance

The workflow:

1. validates the exact commit SHA;
2. verifies CI and CodeQL for that SHA;
3. checks out that exact SHA;
4. plans/applies permitted Production migrations;
5. builds the Vercel Production artifact from the same SHA;
6. deploys that artifact;
7. runs smoke checks;
8. stores `release-evidence.json` as a 30-day artifact.

## Preview validation

Preview-equivalent data/auth verification is already performed in CI with local Supabase, including migrations, seed, RLS, Auth, browser E2E, accessibility, and Lighthouse.

A Vercel Preview may be used for UI/build review but must not receive Production Supabase secrets. A managed remote Preview database can be added later if the product needs persistent staging.

## Resource provisioning still required

Before the first non-dry Production release:

- connect/provision the Vercel project;
- provision one dedicated Production Supabase project;
- populate the protected `production` GitHub Environment secrets;
- configure Production reviewer protection;
- run a Production dry-run;
- verify backup/recovery and monitoring;
- perform a controlled launch and rollback rehearsal.
