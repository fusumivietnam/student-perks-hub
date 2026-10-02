# Browser E2E release gate

The critical browser gate uses Playwright with Chromium against the repository-managed local Supabase stack.

## Scope

The MVP suite covers:

- anonymous offer discovery and offer detail;
- authentication boundary for saved offers;
- email/password login;
- bookmark save/remove with RLS-backed persistence;
- offer submission and verification that the database record remains `pending`;
- non-admin denial for the admin console;
- admin submission moderation.

## Accessibility gate

The same Browser E2E job also runs `@axe-core/playwright` against the critical public pages: home, offers discovery, categories, login, offer submission, and one published offer detail.

The gate blocks serious or critical WCAG A/AA violations and prints rule, impact, help URL, target, and failure summary for diagnosis.

Automated scanning does not replace the manual launch review for keyboard-only use, focus order, screen reader behavior, zoom/reflow, motion, or visual usability.

## CI behavior

E2E runs only when application, shared library/component, database, Next.js configuration, or E2E files change. Documentation-only and repository-governance-only changes skip it.

The E2E job starts a minimal local Supabase stack containing only Postgres, Auth, PostgREST, and the API gateway. Database validation remains a separate, lighter Postgres-only job.

CI uses one Chromium worker to keep the release gate deterministic. On failure it retains trace, screenshot, video, and the HTML report for seven days.

The Playwright test runner is pinned to version 1.63.0 and the axe Playwright integration is pinned to version 4.13.0 in CI. They are installed only inside the E2E runner so the existing application dependency graph and frozen lockfile remain unchanged.

## Local execution

The CI setup is authoritative. For local debugging:

1. run `node scripts/e2e-start.mjs` and `pnpm db:reset`;
2. run `node scripts/e2e-setup.mjs` after exporting equivalent E2E credentials if needed;
3. install `@playwright/test@1.63.0`, `@axe-core/playwright@4.13.0`, and Chromium;
4. run `pnpm exec playwright test`.

No production credentials or production data are used.
