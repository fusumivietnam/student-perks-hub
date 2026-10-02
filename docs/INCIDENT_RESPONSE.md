# Incident response

Use this process for production outages, security incidents, data-integrity problems, or severe user-facing regressions.

## Severity

- **SEV-1:** security breach, material data loss/corruption, or service broadly unavailable.
- **SEV-2:** major feature unavailable or significant subset of users affected.
- **SEV-3:** degraded behavior with a viable workaround.

## Immediate response

1. Establish an incident owner.
2. Preserve evidence and timestamps.
3. Stop risky deployments or automated changes.
4. Reduce impact using the smallest safe mitigation.
5. Rotate credentials immediately if exposure is plausible.
6. Communicate current impact and next update internally.

For security incidents, do not publish exploit details before containment.

## Recovery

- Prefer a known-good application rollback for code-only regressions.
- Treat database rollback separately; destructive schema changes may require restore or a forward fix.
- Verify `/api/health` and critical user flows after mitigation.
- Confirm background/data processes are consistent before closing the incident.

## Post-incident

Create a GitHub issue that records:

- timeline;
- user impact;
- technical root cause;
- detection path;
- mitigation and recovery;
- missing guardrail;
- concrete follow-up work.

Do not use the post-incident review to assign blame. Convert findings into scoped reliability/security work.
