# Implementation Roadmap

Last updated: 2026-10-14

Student Perks Hub is post-launch. The MVP, protected Production topology, first release lifecycle, monitoring, rollback, and encrypted database-backup baseline are complete. New work should be delivered in small vertical slices through PR review and required CI/CodeQL gates.

## Current snapshot

### Platform and delivery foundation — complete

- [x] Next.js App Router + TypeScript + Tailwind CSS 4 baseline
- [x] Supabase SSR clients, authentication, RLS, migrations, deterministic seed, generated database types
- [x] local-first Supabase CLI + Docker development/CI workflow
- [x] fresh Codespaces local-stack verification (#7)
- [x] Node 24 LTS + pinned pnpm + committed lockfile
- [x] typecheck, lint, production build, database/RLS validation
- [x] critical Browser E2E, automated accessibility, Lighthouse budget
- [x] CodeQL, Dependabot, secret scanning, push protection
- [x] protected `main`, squash-only PR flow, repository governance
- [x] GitHub Project synchronization and delivery metadata
- [x] Vercel Production + dedicated Supabase Production in Singapore
- [x] cost-optimized Preview model with no Production privileged Supabase credentials
- [x] exact-SHA protected Production release control plane
- [x] canonical Production release/deployment identity verification

### Product baseline — complete

- [x] offer/category discovery and detail surfaces
- [x] authentication and account flows
- [x] bookmarks and offer submission
- [x] admin authorization/moderation
- [x] privacy-first student verification
- [x] production UI/loading/error/empty states
- [x] metadata, canonical URLs, sitemap, robots, legal/privacy pages
- [x] password-recovery implementation and Production deployment

### Production operations — active and proven

- [x] first-production lifecycle and v1.0.0 evidence (#21)
- [x] protected Production environment and rollback rehearsal (#46)
- [x] observability, `/api/health`, alert/recovery path (#44)
- [x] encrypted Production database backup + restore rehearsal baseline (#45)
- [x] Production health monitor hourly
- [x] daily encrypted logical database backup with no silent enable/disable variable
- [x] daily managed-state/backup-freshness recovery watch
- [x] managed-state readiness manual override removed; non-zero Auth/Storage fails closed until repository-verifiable recovery rehearsal exists
- [x] weekly local encrypted backup/restore rehearsal
- [x] fail-closed migration and canonical release identity gates

## Current post-launch work

### #145 — Recovery evidence and retention hardening

Status: **In progress**

- [x] preserve the existing daily encrypted Production backup lane and 30-day rolling backup retention
- [x] preserve the existing weekly recovery-rehearsal lane; do not create a duplicate workflow
- [x] add structured recovery rehearsal evidence without Production data, PII, or Production secrets
- [x] record measured rehearsal duration and safe aggregate validation counts
- [x] retain the small recovery evidence artifact for 90 days
- [ ] PR validation: recovery rehearsal, CI and CodeQL
- [ ] merge after gates pass

### #136 — Real password-recovery email acceptance

Status: **Deferred; non-blocking for current operations work**

The Production implementation, canonical callback configuration, protected release, fail-closed callback behavior, and recovery-session enforcement are already verified. The remaining acceptance exercise requires a real test mailbox:

1. request password recovery for a real test account;
2. follow the Supabase email link through `/auth/callback`;
3. reach `/reset-password` with a valid recovery session;
4. change the password and verify sign-out;
5. sign in again with the new password.

Keep #136 open until that real-email exercise is performed.

## Recovery maturity boundary

Production currently has no material managed Auth/Storage state. The Free-plan baseline therefore remains intentionally cost-conscious:

- application schema is recoverable from reviewed migrations;
- application data is protected by unconditional daily encrypted logical backups;
- backup freshness is monitored automatically;
- local restore mechanics and authorization invariants are rehearsed weekly;
- managed-state recovery remains fail-closed while Auth + Storage recovery is not genuinely implemented and rehearsed;
- there is no repository variable that can manually bypass the managed-state recovery boundary.

Before meaningful Auth users or Storage objects accumulate, choose one reviewed path:

1. adopt Supabase managed backup/PITR that meets the required RPO/RTO and separately cover Storage object bytes; or
2. implement and rehearse provider-supported encrypted Auth recovery plus Storage metadata/object-byte recovery.

Whichever path is selected must emit non-sensitive evidence that can be validated automatically by the repository before the managed-state watch is allowed to become healthy with non-zero counts.

Do not enable paid recovery infrastructure merely to satisfy a checklist while managed state is still empty.

## Operational priorities

1. **Managed-state recovery implementation** — before meaningful Auth/Storage growth, implement one reviewed recovery path and repository-verifiable rehearsal evidence.
2. **Dependency/runtime/cache maintenance** — keep pinned Actions, Node, pnpm, Supabase CLI and Vercel CLI reviewed and current without overlapping CI lanes.
3. **Observability review** — periodically validate incident auto-open/auto-close and release correlation; avoid collecting sensitive request/session data.
4. **Recovery drills** — continue scheduled backup freshness and weekly restore rehearsal; escalate immediately when managed Auth/Storage state becomes non-zero.
5. **Release evidence hygiene** — keep exact SHA, deployment ID, migration identity and canonical endpoint correlated for every protected Production release.
6. **Product iteration** — new feature slices continue through Issue → PR → CI/CodeQL → merge → protected release only when Production runtime changes.

## End-to-end lifecycle

```text
Idea / requirement
  → Issue / Project triage
  → technical decision
  → implementation branch
  → Pull Request
  → CI Gate + CodeQL + database/browser gates
  → optional Vercel Preview UI/build review
  → protected main
  → exact release candidate SHA
  → Production migration fail-closed gate
  → protected immutable Vercel Production deployment
  → canonical alias + smoke + release evidence
  → monitoring / backup / recovery watch
  → incident response / rollback / restore rehearsal
  → retrospective / follow-up issue
```

## Architecture guardrails

- local development and PR validation use Supabase CLI/Docker;
- do not introduce a second local PostgreSQL stack;
- SQL migrations and declarative schemas remain PostgreSQL-first;
- Preview never receives Production privileged credentials;
- automatic Vercel Production deployment from `main` remains disabled;
- Production deploys use the protected exact-SHA release control plane only;
- destructive/coordinated migrations require explicit recovery planning and are never auto-applied;
- semantic retrieval tools are discovery aids, never source truth, and do not run in CI/Release;
- URL state before global client state;
- Server Components before client fetching where applicable;
- framework/native capability before adding dependencies;
- no unrelated refactors inside feature PRs;
- security, authorization, RLS, validation, accessibility, data integrity, recovery, and auditability are never simplified away.
