# Implementation Roadmap

Last updated: 2026-10-02

Work in small vertical slices. Every implementation slice must go through a pull request, pass the required checks, and receive a Ponytail diff review.

## Current snapshot

### Completed foundation

- [x] Next.js App Router + TypeScript + Tailwind CSS 4 baseline
- [x] Supabase SSR clients and auth proxy baseline
- [x] local-first Supabase CLI + Docker workflow
- [x] declarative database schema under `supabase/schemas/`
- [x] versioned initial migration under `supabase/migrations/`
- [x] deterministic category and verified-offer seed data
- [x] RLS baseline for profiles, categories, offers, bookmarks, and submissions
- [x] generated Supabase database types + drift gate
- [x] Node 24 LTS + pinned pnpm + committed `pnpm-lock.yaml`
- [x] CI: install, typecheck, lint, build
- [x] Database CI: local Supabase start, reset, seed, generated-type drift check
- [x] critical Browser E2E release gate
- [x] automated accessibility release gate
- [x] CodeQL + Dependabot
- [x] secret scanning + push protection
- [x] protected `main` ruleset with squash-only PR flow
- [x] GitHub Project #3 fields, views, and issue/PR synchronization
- [x] repository governance automation
- [x] provider-neutral environment, release, rollback, incident, and security runbooks
- [x] public liveness endpoint at `/api/health`

### Independent platform verification

- [ ] #7 Verify a fresh GitHub Codespace boot end to end

### Completed product slices

- [x] #10 Generate Supabase database types and enforce schema/type drift checks
- [x] #11 Render categories from Supabase
- [x] #12 Implement OfferCard
- [x] #13 Seed a reviewed set of verified offers
- [x] #14 Build homepage offer sections
- [x] #15 Build offers discovery
- [x] #16 Build offer detail page
- [x] #17 Implement Supabase authentication
- [x] #18 Implement bookmarks
- [x] #19 Implement offer submission
- [x] #20 Define admin authorization model
- [x] #43 Add critical browser E2E release gate
- [x] #49 Implement admin moderation console and admin RLS
- [x] #51 Add canonical metadata sitemap and robots
- [x] #53 Add automated accessibility release gate

### Completed automated release gates

- [x] #55 Add production-build performance budget

### Current production-environment slice

- [x] #42 Select production hosting and deployment topology
- [ ] #46 Provision protected Preview and Production environments
- [ ] #44 Establish production observability and alert routing
- [ ] #45 Verify production database backup and restore procedure
- [ ] #21 Complete first-production readiness, rehearsal, release, and rollback evidence

## 00 — Platform baseline

Status: **Complete, with independent Codespaces verification pending**

Remaining verification:

- fresh Codespace boot (#7)

## 01 — Application and database implementation

Status: **Complete**

The MVP application, authentication, bookmarks, submissions, admin authorization/moderation, SEO surfaces, database/RLS model, generated types, browser E2E, and automated accessibility gate are implemented.

## 02 — Automated release gates

Status: **Complete**

Completed:

- [x] typecheck, lint, production build
- [x] database reset/seed/RLS tests/type drift
- [x] Browser E2E critical flows
- [x] automated accessibility gate
- [x] CodeQL and repository security controls
- [x] #55 production-build Lighthouse/performance budget

## 03 — Production topology and environments

Status: **In progress — #42 accepted, #46 active**

Accepted topology:

- Vercel for Next.js application hosting;
- dedicated Supabase Preview project;
- dedicated Supabase Production project;
- GitHub Actions as release/migration control plane.

Required order:

1. [x] #42 select hosting and document application/Supabase topology;
2. [ ] #46 create isolated Preview and Production environments;
3. provision separate remote Preview and Production Supabase projects;
4. configure protected secrets and deployment permissions;
5. support deployment from an exact reviewed commit;
6. enforce one production deployment at a time;
7. add provider-specific application deploy and database migration automation.

Preview must never use production data, production service-role credentials, or the production database.

## 04 — Production operations and recovery

Status: **Blocked on production topology**

Required:

- [ ] #44 application/error monitoring with release SHA correlation
- [ ] #44 availability monitoring for `/api/health`
- [ ] #44 alert owner, channel, and escalation path
- [ ] #45 backup capability and retention documented
- [ ] #45 non-production restore rehearsal
- [ ] production migration classification and recovery plan for destructive changes
- [ ] post-deploy smoke checks
- [ ] immutable release/tag operation
- [ ] production rollback drill
- [ ] incident evidence linked back to release identity

## 05 — First production release

Status: **Not ready**

Issue: #21

All of the following are required before #21 can close:

- [x] metadata, canonical URLs, Open Graph
- [x] sitemap and robots
- [x] critical Browser E2E
- [x] automated accessibility gate
- [x] #55 performance budget
- [ ] manual accessibility review
- [ ] final legal/privacy review
- [x] #42 hosting/topology decision
- [ ] #46 isolated Preview / Production environments
- [ ] remote Preview / Production Supabase projects
- [ ] protected secrets and production deployment permissions
- [ ] production database migration gate
- [ ] deploy concurrency protection
- [ ] #44 observability and alert routing
- [ ] #45 backup/restore verification
- [ ] provider-specific deploy automation
- [ ] Preview dress rehearsal from an exact commit SHA
- [ ] release identity recorded as tag + commit SHA + workflow/deployment evidence
- [ ] post-deploy smoke checks
- [ ] production rollback drill
- [ ] launch evidence recorded on #21

## End-to-end lifecycle

```text
Idea / requirement
  → Issue / Project triage
  → technical decision
  → agent:ready
  → implementation branch
  → Pull Request
  → CI Gate + CodeQL + database/browser gates
  → Preview
  → review
  → merge to main
  → immutable release candidate SHA
  → production migration gate
  → protected Production deployment
  → smoke checks
  → monitoring / alerting
  → incident response when required
  → rollback / restore
  → retrospective / follow-up issue
```

## Delivery order

```text
#55 Performance budget ✓
        ↓
#42 Hosting / topology decision ✓
        ↓
#46 Preview + Production environments
        ↓
#44 Observability ─────┐
#45 Backup/restore ────┤
                      ↓
     Preview dress rehearsal
                      ↓
 manual accessibility + legal review
                      ↓
         #21 production release
                      ↓
      rollback/restore evidence
```

#7 Codespaces verification is independent and should be completed without blocking the production-topology decision.

## Architecture guardrails

- local development uses Supabase CLI/Docker; do not add a second PostgreSQL Docker stack
- SQL migrations and declarative schemas remain portable PostgreSQL-first
- no production provider is assumed until #42 is approved
- Preview and Production use isolated data and credentials
- production deploys use an exact reviewed commit and one deployment concurrency lane
- destructive database changes require explicit recovery planning
- URL state before global client state
- Server Components before client fetching where applicable
- framework/native capability before adding dependencies
- no unrelated refactors inside feature PRs
- security, authorization, RLS, validation, accessibility, data integrity, recovery, and auditability are never simplified away
