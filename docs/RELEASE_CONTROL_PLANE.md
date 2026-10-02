# Release control plane

The repository uses GitHub Actions as the release control plane for the Vercel + Supabase topology accepted in ADR-0001.

## Workflow

`.github/workflows/release.yml` is manual by design. It accepts:

- target environment: `preview` or `production`;
- exact 40-character commit SHA;
- whether database migrations should be applied;
- migration class;
- dry-run mode.

A release SHA must already be reachable from protected `main` and must have successful `CI` and `CodeQL` workflow runs for that exact SHA.

## Environment protection

Create two GitHub Environments:

- `preview`
- `production`

The Production environment should require explicit reviewer approval before jobs can access its secrets. Preview and Production must have different secret values.

Required environment-scoped secrets:

### Vercel

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- optional `VERCEL_AUTOMATION_BYPASS_SECRET` when Deployment Protection is enabled

### Supabase

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD`

Do not store those values as repository files or plaintext workflow constants.

## Concurrency

The workflow uses one concurrency group per release environment and does not cancel an in-flight release.

This means Production has one serialized migration/deployment lane.

## Migration gate

The workflow always runs a remote `supabase db push --dry-run` before applying migrations.

Automated application is allowed only for migrations classified as `backward-compatible`.

`coordinated` and `destructive` migrations fail closed and must follow the reviewed release/rollback runbook with explicit human sequencing.

## Deployment provenance

The workflow:

1. validates the exact commit SHA;
2. verifies successful CI and CodeQL for that SHA;
3. checks out that exact SHA;
4. plans/applies permitted migrations;
5. builds a Vercel artifact from the same SHA;
6. deploys that artifact;
7. runs smoke checks;
8. stores `release-evidence.json` as a 30-day workflow artifact.

Release evidence records environment, commit SHA, deployment URL, workflow run ID, migration state, and smoke-check results.

## Smoke checks

Post-deploy smoke checks validate:

- `/api/health`;
- `/`;
- `/offers/github-student-developer-pack`.

If Vercel Deployment Protection is enabled, configure the environment-scoped automation bypass secret so CI can verify Preview without making Preview public.

## Dry-run

Use `dry_run=true` before the first real Preview release.

Dry-run validates provenance and, when requested, remote migration planning without deploying the application.

## Resource provisioning still required

The workflow is intentionally unable to invent credentials or paid resources.

Before the first non-dry release:

- connect/provision the Vercel project;
- provision dedicated Preview and Production Supabase projects;
- populate the two GitHub Environments with isolated secrets;
- configure Production environment reviewer protection;
- test Preview migration/deploy/smoke/rollback end to end.
