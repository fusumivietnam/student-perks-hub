# ADR-0002 — Cost-optimized preview strategy

Status: **Accepted**  
Date: 2026-10-03  
Related issues: #46, #21  
Amends: ADR-0001 Preview topology

## Decision

For the initial MVP / beta phase:

- **Production** uses one dedicated managed Supabase project.
- **Pull-request and release validation** use the repository-managed local Supabase stack in GitHub Actions.
- **Vercel Preview deployments** are optional UI/build review surfaces and must not receive Production Supabase secrets, migration credentials, service-role credentials, or Production deployment permission.
- A continuously running managed Supabase Preview project is **not required** before the first launch.
- A managed Preview/Staging Supabase project may be added later when remote interactive rehearsal becomes valuable enough to justify its cost.

ADR-0001 remains authoritative for Vercel as the application host, Supabase as the Production backend, exact-SHA release provenance, Production concurrency, migration gating, rollback, and release evidence. This ADR replaces only the requirement that Preview must have a dedicated managed Supabase project from day one.

## Why

The repository already performs deterministic Preview-equivalent validation with:

- local Supabase Postgres;
- Auth;
- PostgREST;
- migrations and seed data;
- RLS / authorization tests;
- production Next.js build;
- browser E2E;
- accessibility checks;
- Lighthouse performance budgets;
- CodeQL and CI Gate.

Keeping a second managed database online only to duplicate those checks adds recurring cost without materially increasing confidence for the initial launch.

## Topology

```text
Developer / Codespaces
        │
        └── local Supabase CLI / Docker

Pull Request
        │
        ├── GitHub Actions
        │     ├── local Supabase
        │     ├── migrations / seed / RLS
        │     ├── production Next.js build
        │     ├── browser E2E
        │     ├── accessibility
        │     └── Lighthouse
        │
        └── optional Vercel Preview
              └── no Production Supabase credentials

Protected main / release SHA
        │
        ├── CI Gate + CodeQL
        ├── protected migration gate
        └── Vercel Production
              └── managed Supabase Production
```

## Preview contract

The authoritative Preview validation environment is CI, not a long-lived remote database.

CI Preview is disposable and deterministic. It starts from repository migrations and seed data on every run.

Vercel Preview may be used for visual/build review, but until a dedicated remote Preview backend exists it is **not** considered a full data/auth rehearsal environment.

Vercel Preview must never be pointed at Production using privileged credentials as a shortcut.

## Production contract

Production continues to require:

- a dedicated managed Supabase project;
- environment-scoped Production secrets;
- protected deployment permission;
- exact reviewed commit SHA;
- successful CI and CodeQL for that SHA;
- migration classification and dry-run;
- one serialized Production release lane;
- post-deploy smoke checks;
- release evidence;
- backup/recovery planning.

## Migration rehearsal

Before Production migrations:

1. migrations are rebuilt and tested against disposable local Supabase in CI;
2. database authorization / RLS tests pass;
3. generated types have no drift;
4. the Production release workflow performs a remote migration dry-run;
5. only backward-compatible migrations may be applied automatically.

Coordinated or destructive migrations remain human-gated.

## When to add managed Preview Supabase

Add a dedicated managed Preview/Staging project when one or more of these become true:

- remote OAuth/provider callbacks must be rehearsed before Production;
- external integrations require stable callback URLs or shared remote state;
- product stakeholders require persistent interactive staging data;
- Production migration rehearsals need provider-specific behavior unavailable locally;
- the additional environment cost is justified by release frequency or risk.

## Consequences

Benefits:

- lower initial recurring cost;
- no weakened CI coverage;
- fewer credentials and environments to secure;
- local development remains provider-independent;
- Production remains fully isolated.

Trade-off:

- Vercel Preview is not a complete remote end-to-end staging environment until a managed Preview backend is added.

This trade-off is accepted for MVP / beta and must be revisited before higher-risk integrations or a stronger staging requirement appears.
