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
  → CI + CodeQL + database validation
  → Preview
  → review
  → merge to main
  → release gate
  → production deployment
  → smoke checks
  → monitoring
  → incident / rollback when required
  → retrospective and follow-up
```

## Current maturity

Implemented:

- local reproducible development;
- issue / Project / milestone governance;
- custom agents and routing metadata;
- pull-request workflow;
- CI Gate;
- conditional database validation;
- CodeQL;
- Dependabot, secret scanning, push protection;
- protected main branch;
- production-readiness environment and release contracts;
- health endpoint;
- release, rollback and incident runbooks.

Still required before first production release:

- complete admin authorization/moderation;
- select application hosting provider;
- create Preview and Production deployment environments;
- provision remote Preview and Production Supabase projects;
- configure protected secrets and deployment permissions;
- implement critical browser E2E tests;
- add accessibility and performance gates;
- establish application/error monitoring and alert routing;
- confirm database backup/restore procedures with the selected Supabase plan;
- add provider-specific deploy + migration automation;
- perform a staging/Preview dress rehearsal;
- execute a documented production release and rollback drill.
