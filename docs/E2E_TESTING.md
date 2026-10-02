# Browser E2E release gate

The critical browser gate uses Playwright with Chromium against the repository-managed local Supabase stack.

## Scope

The MVP suite covers:

- anonymous offer discovery and offer detail;
- authentication boundary for saved offers;
- email/password login;
- bookmark save/remove with RLS-backed persistence;
- offer submission and verification that the database record remains `pending`.

Admin flows remain out of scope until admin authorization/moderation is complete.

## CI behavior

E2E runs only when application, shared library/component, database, Next.js configuration, or E2E files change. Documentation-only and repository-governance-only changes skip it.

The E2E job starts a minimal local Supabase stack containing only Postgres, Auth, PostgREST, and the API gateway. Database validation remains a separate, lighter Postgres-only job.

CI uses one Chromium worker to keep the release gate deterministic. On failure it retains trace, screenshot, video, and the HTML report for seven days.

The Playwright test runner is pinned to version 1.63.0 in CI. It is installed only inside the E2E runner so the existing application dependency graph and frozen lockfile remain unchanged.

## Local execution

The CI setup is authoritative. For local debugging:

1. run `node scripts/e2e-start.mjs` and `pnpm db:reset`;
2. run `node scripts/e2e-setup.mjs` after exporting equivalent E2E credentials if needed;
3. install `@playwright/test@1.63.0` and Chromium;
4. run `pnpm exec playwright test`.

No production credentials or production data are used.
