# Production observability

This document defines the minimum-cost observability baseline for Student Perks Hub. It intentionally uses the hosting and repository platforms already in the stack rather than adding another monitoring vendor before the product needs one.

## Signals

### Application errors

Next.js server errors are captured through the root `instrumentation.ts` `onRequestError` hook and emitted as structured JSON to Vercel Runtime Logs.

The structured record contains only operational context:

- event name;
- error class and Next.js digest when available;
- HTTP method and path without query parameters;
- route/router context;
- Vercel environment;
- immutable Git commit SHA;
- deployment ID;
- execution region.

Request headers, cookies, authorization values, query strings, request/response bodies, session values, Supabase keys, and database credentials are deliberately excluded.

Vercel automatically attaches request/deployment metadata to runtime log entries. Correlate `releaseSha` and `deploymentId` with the exact Git commit and Vercel deployment before rollback or incident decisions.

### Health and release identity

`GET /api/health` is public and cache-disabled. A healthy Production response must include:

- `status: "ok"`;
- `service: "student-perks-hub"`;
- `environment: "production"`;
- a 40-character Git release SHA;
- a Vercel deployment ID beginning with `dpl_`;
- the runtime region;
- a current timestamp.

The endpoint does not expose secrets or perform a destructive probe. Database-backed application smoke remains part of the release workflow and production verification.

### Availability monitor

`.github/workflows/production-monitor.yml` checks the canonical Production `/api/health` endpoint every 30 minutes.

Failure behavior:

1. the workflow validates HTTP 200 and the health payload/release identity;
2. on failure, it opens or updates one deduplicated GitHub issue titled `[monitor] Production health check failing`;
3. the issue uses existing `type:bug`, `area:platform`, and `needs:human` routing labels;
4. the workflow run itself fails so GitHub Actions notifications remain a second signal;
5. when a later health check succeeds, the workflow comments with the recovered release/deployment and closes the monitor issue.

This is a launch baseline, not a hard real-time SLA. GitHub scheduled workflows can be delayed. If availability/SLO requirements become stricter, move the probe to a dedicated external uptime service without weakening the current release correlation fields.

## Alert ownership and escalation

Primary operational owner: repository/Production maintainers for `fusumivietnam/student-perks-hub`.

Primary alert channel: the deduplicated GitHub incident issue plus the failed GitHub Actions run. Maintainers must keep GitHub notification settings capable of surfacing failed Actions/issues for this repository.

Escalation follows `docs/INCIDENT_RESPONSE.md`:

- SEV-1: broad outage, security breach, material data loss/corruption — stop risky changes and begin containment/recovery immediately;
- SEV-2: major user-facing function unavailable — assign an incident owner and mitigate promptly;
- SEV-3: degraded behavior with workaround — record and schedule corrective work.

If the monitoring workflow itself becomes disabled or repeatedly fails for runner/platform reasons, that failure is visible in GitHub Actions and must be treated as loss of monitoring coverage.

## Controlled verification

The monitor has a manual `simulate_failure` input. It exercises the alert path without changing Production or making `/api/health` unhealthy.

Verification sequence:

1. dispatch `Production Monitor` with `simulate_failure=true`;
2. confirm one monitor issue is opened/updated and the workflow fails intentionally;
3. dispatch it again with `simulate_failure=false` (or wait for the next scheduled run);
4. confirm Production health passes, a recovery comment is added, and the monitor issue closes;
5. inspect Vercel Runtime Logs for the active deployment and confirm release/deployment context is available;
6. for a controlled application-error test, use a non-user-data error path in a reviewed test change; never intentionally corrupt Production data or expose credentials merely to generate a log entry.

Record links to the verification runs/issues in #44 and the umbrella #21 issue.

## Provider configuration

Vercel system environment variables are enabled for the project so runtime code can read `VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`, `VERCEL_DEPLOYMENT_ID`, and `VERCEL_REGION` after a fresh deployment.

No log drain is required for the initial release. Vercel Runtime Logs are the current error investigation surface. Add a log drain or dedicated APM only when longer retention, custom metric alerts, or cross-system aggregation is justified.
