# Development lifecycle

The project lifecycle is:

```text
Idea / requirement
  → Issue
  → Project triage
  → Design / technical decision
  → agent:ready
  → implementation branch
  → Pull Request
  → CI Gate + CodeQL + conditional database/browser validation
  → Preview
  → review
  → merge to main
  → immutable release candidate SHA
  → production migration gate
  → protected production deployment
  → smoke checks
  → monitoring / alerting
  → incident response when required
  → rollback / restore
  → retrospective and follow-up
```

## Implemented controls

- local reproducible development;
- issue / Project / milestone governance;
- custom agents and routing metadata;
- pull-request workflow;
- CI Gate;
- conditional database validation and RLS tests;
- generated database-type drift gate;
- critical Browser E2E release gate;
- automated accessibility release gate;
- CodeQL;
- Dependabot, secret scanning, and push protection;
- protected `main` branch;
- provider-neutral environment and release contracts;
- health endpoint;
- release, rollback, incident-response, and security runbooks.

## Production lifecycle gates

The first production release is not complete until all gates below have evidence.

### Topology and isolation

- hosting provider and topology approved (#42);
- isolated Preview and Production application environments (#46);
- separate Preview and Production Supabase projects;
- Preview never uses production data or production service-role credentials;
- production secrets are stored outside the repository and access is protected.

### Release quality

- CI Gate and CodeQL pass on the exact release commit;
- database validation passes when relevant;
- Browser E2E, automated accessibility, and performance budgets pass;
- manual accessibility review is recorded;
- final legal/privacy review is recorded.

### Deployment safety

- every deploy identifies the exact commit SHA;
- production migrations are reviewed and classified before execution;
- destructive migrations have an explicit recovery plan;
- one production deployment runs at a time;
- application and database promotion order is documented;
- the same reviewed source commit is promoted through Preview and Production.

### Operations and recovery

- application errors include environment and release identity (#44);
- `/api/health` is monitored and alert routing is tested (#44);
- backup retention and restore procedure are documented (#45);
- a non-production restore rehearsal is completed (#45);
- post-deploy smoke checks are recorded;
- rollback to a known-good application release is tested;
- release evidence links tag, commit SHA, deployment, migrations, and verification results.

## Closure rule

Issue #21 is the umbrella launch gate. It closes only after the Preview dress rehearsal, production release, smoke checks, monitoring verification, and rollback/restore evidence have been recorded.

A production incident feeds back into the same lifecycle:

```text
alert
  → triage
  → incident owner
  → mitigate / rollback / restore
  → verify service health
  → document release and data impact
  → retrospective
  → follow-up issue / test / control
```

This makes production operations part of development rather than a separate undocumented process.
