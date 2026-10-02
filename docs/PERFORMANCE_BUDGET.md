# Performance budget

Student Perks Hub uses Lighthouse CI as a deterministic production-build release gate.

## Scope

The gate audits:

- the homepage: `/`;
- one published offer detail: `/offers/github-student-developer-pack`.

The audit runs against `next build` + `next start`, not the development server, and reuses the same local Supabase environment as browser E2E.

## Budgets

CI currently enforces conservative desktop thresholds:

- Lighthouse performance score: **>= 0.75**
- Largest Contentful Paint: **<= 4.0 s**
- Cumulative Layout Shift: **<= 0.10**
- Total Blocking Time: **<= 600 ms**

These thresholds are intended to catch material regressions while remaining stable on shared GitHub-hosted runners. Tighten them only after enough CI history exists to distinguish real regressions from runner variance.

## Tooling

Lighthouse CI is pinned to `@lhci/cli@0.15.1` in the browser validation job. The runtime-only install is not committed into the application dependency graph.

Lighthouse artifacts are retained for seven days when the performance gate fails.

## Local verification

1. start the local E2E Supabase stack;
2. reset the database;
3. build the application with `pnpm build`;
4. install the pinned Lighthouse CI CLI;
5. run `pnpm exec lhci autorun --config=./lighthouserc.cjs`.

The gate is provider-neutral and does not assume a production hosting vendor.
