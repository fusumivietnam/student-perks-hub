# Product roadmap

This document defines direction and sequencing only. It deliberately does **not** record the current PR, main SHA, CI state, completed checkboxes, or open blockers. Those are live repository state and belong in GitHub; use [`STATUS.md`](./STATUS.md) as the stable entry point.

## Delivery model

Routine post-launch work follows [`DELIVERY_MODE.md`](./DELIVERY_MODE.md): one cohesive vertical slice per branch/PR, protected CI and CodeQL gates, auto-merge after green checks, and release trains rather than deploy-on-every-merge.

## Product completion sequence

```text
Discovery & conversion
  -> Account & ownership
  -> Student verification
  -> Submission workflow
  -> Admin operations
  -> UX / accessibility / performance polish
  -> Mature production iteration
```

The sequence is directional, not a status checklist. A slice may be revisited when evidence or user needs justify it.

### Discovery & conversion

Improve offers/search/brand/detail navigation, filtering, recovery from empty states, CTA quality, and conversion paths.

### Account & ownership

Keep saved offers, account state, submission ownership/history, authentication return paths, and authenticated/anonymous transitions consistent.

### Student verification

Keep the verification lifecycle understandable, privacy-first, reviewable by admins, and explicit about pending/verified/rejected/expired states.

### Submission workflow

Improve submission validation, ownership/history, duplicate handling, moderation lifecycle, and contributor feedback.

### Admin operations

Improve moderation, freshness, verification, content-management, and operational queues without weakening authorization boundaries.

### UX quality

Continuously improve responsive behavior, accessibility, loading/error/empty states, metadata/SEO, and measured performance.

## Platform and operations track

Product work runs alongside a smaller platform/operations track:

```text
protected CI / CodeQL
  -> release safety
  -> monitoring and recovery rehearsals
  -> remote managed-state recovery proof
  -> dependency/runtime compatibility
  -> operational maturity
```

Platform work should be driven by a concrete risk, bottleneck, compatibility boundary, or production requirement rather than routine churn.

## Architecture guardrails

- Local development and PR validation use Supabase CLI/Docker.
- Declarative schemas and reviewed migrations remain the database source of truth.
- Preview never receives Production privileged credentials.
- Production deploys use the protected exact-SHA release control plane.
- Destructive/coordinated migrations require explicit recovery planning and are never auto-applied.
- URL state is preferred before introducing global client state.
- Server Components are preferred before client fetching where applicable.
- Framework/native capability is preferred before adding dependencies.
- Security, authorization, RLS, validation, accessibility, data integrity, recovery, and auditability are not traded away for delivery speed.

## Documentation ownership

- **Live execution state:** GitHub PRs, Issues, Actions, and Project views via [`STATUS.md`](./STATUS.md).
- **Delivery policy:** [`DELIVERY_MODE.md`](./DELIVERY_MODE.md).
- **Release execution:** [`RELEASE_RUNBOOK.md`](./RELEASE_RUNBOOK.md) and [`RELEASE_CONTROL_PLANE.md`](./RELEASE_CONTROL_PLANE.md).
- **Recovery:** [`DATABASE_RECOVERY.md`](./DATABASE_RECOVERY.md) and [`MANAGED_STATE_RECOVERY_CHECKLIST.md`](./MANAGED_STATE_RECOVERY_CHECKLIST.md).
- **Operations:** [`OBSERVABILITY.md`](./OBSERVABILITY.md) and [`INCIDENT_RESPONSE.md`](./INCIDENT_RESPONSE.md).

Do not copy live status or completed-work history back into this roadmap. Git history and merged PRs already provide that record.
