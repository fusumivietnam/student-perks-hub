# Implementation Roadmap

Last updated: 2026-10-03

Work in small vertical slices. Every implementation slice must go through a pull request, pass the required checks, and receive a Ponytail diff review.

## Current snapshot

### Completed foundation

- [x] Next.js App Router + TypeScript + Tailwind CSS 4 baseline
- [x] Supabase SSR clients and auth proxy baseline
- [x] local-first Supabase CLI + Docker workflow
- [x] declarative database schema under `supabase/schemas/`
- [x] versioned migrations and deterministic seed data
- [x] RLS baseline and database authorization tests
- [x] generated Supabase database types + drift gate
- [x] Node 24 LTS + pinned pnpm + committed lockfile
- [x] CI: install, typecheck, lint, production build
- [x] Browser E2E, accessibility, Lighthouse performance budget
- [x] CodeQL + Dependabot + secret scanning + push protection
- [x] protected `main` + squash-only PR flow
- [x] GitHub Project fields/views/synchronization and repository governance
- [x] environment/release/rollback/incident/security runbooks
- [x] public `/api/health`
- [x] exact-SHA Production release control plane

### Independent platform verification

- [ ] #7 Verify a fresh GitHub Codespace boot end to end

### Completed product slices

- [x] #10 database type drift gate
- [x] #11 categories from Supabase
- [x] #12 OfferCard
- [x] #13 verified offer seed set
- [x] #14 homepage offer sections
- [x] #15 offers discovery
- [x] #16 offer detail
- [x] #17 Supabase authentication
- [x] #18 bookmarks
- [x] #19 offer submission
- [x] #20 admin authorization model
- [x] #43 critical Browser E2E gate
- [x] #49 admin moderation console + admin RLS
- [x] #51 canonical metadata / sitemap / robots
- [x] #53 automated accessibility gate
- [x] #55 production-build performance budget

### Current production-environment slice

- [x] #42 Select production hosting and deployment topology
- [ ] #46 Provision protected Production environment and cost-optimized Preview model
- [ ] #44 Establish production observability and alert routing
- [ ] #45 Verify production database backup and restore procedure
- [ ] #21 Complete first-production readiness, rehearsal, release, and rollback evidence

## 00 — Platform baseline

Status: **Complete, with independent Codespaces verification pending**

Remaining verification:

- fresh Codespace boot (#7)

## 01 — Application and database implementation

Status: **Complete**

The MVP application, authentication, bookmarks, submissions, admin authorization/moderation, SEO surfaces, database/RLS model, generated types, browser E2E, accessibility, and performance gates are implemented.

## 02 — Automated release gates

Status: **Complete**

- [x] typecheck, lint, production build
- [x] database reset/seed/RLS tests/type drift
- [x] Browser E2E critical flows
- [x] automated accessibility gate
- [x] Lighthouse production-build performance budget
- [x] CodeQL and repository security controls

## 03 — Production topology and environments

Status: **In progress — #42 accepted, #46 active**

Accepted topology after ADR-0002:

- Vercel for Next.js application hosting;
- local Supabase in GitHub Actions as the authoritative PR/Preview validation environment;
- optional Vercel Preview for UI/build review with no Production Supabase secrets;
- one dedicated managed Supabase Production project for the initial MVP/beta phase;
- GitHub Actions as Production release/migration control plane.

Completed:

- [x] exact reviewed SHA required for release;
- [x] exact-SHA CI + CodeQL provenance gate;
- [x] single serialized Production release lane;
- [x] remote migration dry-run gate;
- [x] automatic migration limited to backward-compatible changes;
- [x] provider-specific Vercel Production build/deploy path;
- [x] post-deploy smoke evidence contract.

Remaining under #46:

1. [ ] provision one dedicated managed Supabase Production project;
2. [ ] connect/provision the Vercel project;
3. [ ] create protected `production` environment secrets and reviewer protection;
4. [ ] configure Production Vercel environment variables;
5. [ ] run release workflow in `dry_run=true` mode;
6. [ ] perform first controlled Production deployment/smoke check;
7. [ ] demonstrate immutable application rollback.

A managed Preview Supabase project is not required for the initial launch. Add one later only when persistent remote staging is justified.

## 04 — Production operations and recovery

Status: **Blocked on Production resource provisioning**

Required:

- [ ] #44 application/error monitoring with release SHA correlation
- [ ] #44 availability monitoring for `/api/health`
- [ ] #44 alert owner, channel, and escalation path
- [ ] #45 Production backup capability and retention documented
- [ ] #45 restore rehearsal using a safe non-production target or provider-supported recovery workflow
- [ ] migration recovery plan for destructive changes
- [ ] immutable release/tag operation
- [ ] Production rollback drill
- [ ] incident evidence linked to release identity

## 05 — First production release

Status: **Not ready**

Issue: #21

Required before closure:

- [x] metadata, canonical URLs, Open Graph
- [x] sitemap and robots
- [x] critical Browser E2E
- [x] automated accessibility gate
- [x] performance budget
- [ ] manual accessibility review
- [ ] final legal/privacy review
- [x] hosting/topology decision
- [x] cost-optimized Preview strategy
- [ ] managed Supabase Production project
- [ ] protected Production secrets and deployment permissions
- [x] production database migration gate logic
- [x] deploy concurrency protection
- [ ] #44 observability and alert routing
- [ ] #45 backup/restore verification
- [x] provider-specific deploy automation
- [ ] Production dry-run from an exact commit SHA
- [ ] release identity recorded as tag + commit SHA + workflow/deployment evidence
- [ ] post-deploy smoke checks
- [ ] production rollback drill
- [ ] launch evidence recorded on #21

## End-to-end lifecycle

```text
Idea / requirement
  → Issue / Project triage
  → technical decision
  → implementation branch
  → Pull Request
  → CI Gate + CodeQL + local Supabase/browser gates
  → optional Vercel Preview UI/build review
  → merge to main
  → immutable release candidate SHA
  → Production migration dry-run / gate
  → protected Vercel Production deployment
  → managed Supabase Production
  → smoke checks
  → monitoring / alerting
  → incident response / rollback / restore
  → retrospective / follow-up issue
```

## Delivery order

```text
#42 Hosting / topology ✓
        ↓
ADR-0002 cost-optimized Preview ✓
        ↓
#46 Production resources + protected release
        ↓
#44 Observability ─────┐
#45 Backup/restore ────┤
                      ↓
 manual accessibility + legal review
                      ↓
         #21 production release
                      ↓
      rollback/restore evidence
```

#7 Codespaces verification remains independent.

## Architecture guardrails

- local development and PR validation use Supabase CLI/Docker;
- do not introduce a second local PostgreSQL stack;
- SQL migrations and declarative schemas remain PostgreSQL-first;
- Preview never receives Production privileged credentials;
- Production uses an exact reviewed commit and one deployment concurrency lane;
- destructive migrations require explicit recovery planning;
- URL state before global client state;
- Server Components before client fetching where applicable;
- framework/native capability before adding dependencies;
- no unrelated refactors inside feature PRs;
- security, authorization, RLS, validation, accessibility, data integrity, recovery, and auditability are never simplified away.
