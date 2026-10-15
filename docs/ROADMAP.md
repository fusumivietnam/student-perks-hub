# Implementation Roadmap

Last updated: 2026-10-15

Student Perks Hub is post-launch. The MVP, protected Production topology, first release lifecycle, monitoring, rollback, and encrypted database-backup baseline are complete. Routine work now uses **Fast Delivery Mode**: deliver cohesive vertical slices in batched PRs, prefer one atomic commit when practical, keep required CI/CodeQL/domain gates, auto-merge after green checks, and release through a protected release train only when Production runtime changes justify it.

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
- [x] Fast Delivery Mode governance for batched vertical-slice PRs and release trains

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
- [x] managed Auth/Storage synthetic recovery rehearsal with 90-day structured evidence
- [x] fail-closed migration and canonical release identity gates

## Current post-launch work

### #155 — Repository-verifiable Auth/Storage recovery

Status: **Active boundary follow-up**

- [x] remove manual managed-state readiness override
- [x] add synthetic local Auth loss/reprovision rehearsal
- [x] add Storage object-byte loss/restore rehearsal with SHA-256 verification
- [x] emit structured non-sensitive evidence retained for 90 days
- [x] run rehearsal on protected-main changes and weekly schedule
- [x] document provider/project rebuild checklist
- [ ] prove the selected remote recovery path before Production managed state becomes material

### #136 — Real password-recovery email acceptance

Status: **Deferred; non-blocking for current operations work**

The Production implementation, canonical callback configuration, protected release, fail-closed callback behavior, and recovery-session enforcement are already verified. The remaining acceptance exercise requires a real test mailbox:

1. request password recovery for a real test account;
2. follow the Supabase email link through `/auth/callback`;
3. reach `/reset-password` with a valid recovery session;
4. change the password and verify sign-out;
5. sign in again with the new password.

Keep #136 open until that real-email exercise is performed.

### Dependency maintenance boundary

Routine dependency updates remain grouped. A grouped Supabase upgrade is **not** allowed to merge when the upgraded CLI changes generated database types without the corresponding reviewed type update. Treat such a failure as a compatibility boundary, close the routine Dependabot PR, and reintroduce it later as a deliberate Supabase compatibility batch with generated types, DB validation and recovery rehearsals updated together.

## Fast Delivery Mode

Routine implementation should follow `docs/DELIVERY_MODE.md`.

Default shape:

```text
objective / issue
  -> one implementation branch
  -> one cohesive batch
  -> one atomic commit when practical
  -> one PR
  -> CI + CodeQL + relevant domain gates
  -> auto-merge
  -> protected main
  -> release train when needed
```

Documentation, tests, workflow changes and cleanup that directly belong to the same objective should remain in the same PR. Split only for real security, destructive-migration, ownership, rollback or review boundaries.

Dependency updates are grouped weekly into a small set of coherent fault domains rather than one PR per patch package.

## Recovery maturity boundary

Production currently has no material managed Auth/Storage state. The Free-plan baseline therefore remains intentionally cost-conscious:

- application schema is recoverable from reviewed migrations;
- application data is protected by unconditional daily encrypted logical backups;
- backup freshness is monitored automatically;
- local restore mechanics and authorization invariants are rehearsed weekly;
- synthetic Auth/Storage loss-and-recovery mechanics are rehearsed weekly with structured evidence;
- managed-state recovery remains fail-closed while a real remote recovery path is not genuinely proven;
- there is no repository variable that can manually bypass the managed-state recovery boundary.

Before meaningful Auth users or Storage objects accumulate, choose one reviewed path:

1. adopt Supabase managed backup/PITR that meets the required RPO/RTO and separately cover Storage object bytes; or
2. implement and rehearse provider-supported encrypted Auth recovery plus Storage metadata/object-byte recovery.

Whichever path is selected must emit non-sensitive evidence that can be validated automatically by the repository before the managed-state watch is allowed to become healthy with non-zero counts.

Do not enable paid recovery infrastructure merely to satisfy a checklist while managed state is still empty.

## Operational priorities

1. **Backlog hygiene** — keep routine open PRs near zero; close superseded or compatibility-blocked dependency PRs instead of carrying stale maintenance work.
2. **Managed-state recovery implementation** — before meaningful Auth/Storage growth, prove one reviewed remote recovery path and repository-verifiable evidence.
3. **Product iteration** — shift the majority of implementation effort to user-facing vertical slices now that the platform baseline is stable.
4. **Dependency/runtime/cache maintenance** — use grouped weekly dependency PRs; major or generator-changing upgrades become explicit compatibility batches.
5. **CI efficiency** — continue path-based gates and reduce duplicate build work only where it does not increase flakiness or weaken release assurance.
6. **Observability and recovery drills** — validate incident auto-open/auto-close, backup freshness, release correlation and scheduled restore rehearsals.

## Next product delivery sequence

Deliver these as larger vertical slices, normally one active feature PR at a time:

1. **Discovery & conversion** — offers/search/brand/detail filtering and CTA quality.
2. **Account & ownership** — saved/account/submission/verification UX polish and security surfaces.
3. **Admin operations** — moderation, freshness, verification and operational queues.
4. **UX quality** — mobile, accessibility, empty/loading/error consistency and measured performance improvements.

Release by train after a coherent user-facing batch, not after each merge.

## End-to-end lifecycle

```text
Idea / requirement
  -> Issue / Project triage
  -> delivery batch / technical decision
  -> implementation branch
  -> cohesive vertical slice
  -> Pull Request
  -> CI Gate + CodeQL + relevant database/browser/recovery gates
  -> optional Vercel Preview UI/build review
  -> auto-merge to protected main
  -> release train / exact release candidate SHA
  -> Production migration fail-closed gate
  -> protected immutable Vercel Production deployment
  -> canonical alias + smoke + release evidence
  -> monitoring / backup / recovery watch
  -> incident response / rollback / restore rehearsal
  -> retrospective / follow-up only when it crosses a real boundary
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
