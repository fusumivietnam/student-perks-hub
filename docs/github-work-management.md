# GitHub work management

GitHub is the operational source of truth for delivery.

## Responsibilities

- Issues are units of work.
- Labels classify work and provide routing signals.
- Project fields own Status, Priority, Area, Target, and Size.
- Views are projections of the same Project data.
- Milestones represent release stages.
- Custom agents implement or review scoped work.
- Actions validate changes.
- Pull requests are the unit of code review.
- `main` contains validated state.

## Labels

Type labels:

- `type:feature`
- `type:bug`
- `type:chore`
- `type:docs`

Area labels:

- `area:platform`
- `area:database`
- `area:offers`
- `area:auth`
- `area:admin`
- `area:ux`
- `area:seo`

Risk labels:

- `risk:security`
- `risk:migration`
- `risk:breaking`

Routing and guard labels:

- `agent:ready` means the issue is scoped enough for implementation.
- `needs:human` blocks agent-ready routing until a human decision is made.
- `needs:design` blocks implementation until design direction is resolved.

Do not duplicate Project Priority, Status, Target, or Size as labels.

## Milestones

The repository-managed release milestones are:

1. MVP
2. Private Beta
3. Public Beta
4. v1.0

Milestones intentionally have no invented due dates. Add a due date only when a real delivery commitment exists.

## Agent routing

Choose the agent that matches the dominant work area:

- frontend: application UI and Next.js frontend
- database: schema, migrations, RLS, pgTAP, generated database types
- qa: defect reproduction and regression verification
- security: auth, authorization, RLS, secrets, sensitive admin/security work
- repo-maintainer: Actions, Codespaces, Projects, dependencies, repository automation
- design: approved UX direction and implementation-ready design guidance

`agent:ready` changes an issue to Project status `Ready` only when neither `needs:human` nor `needs:design` is present.

Agents may create implementation branches and pull requests, but they must not bypass CI Gate, CodeQL, or required human review.

## Automation ownership

`.github/scripts/project_sync.py` is the desired-state owner for repository labels, release milestones, Project metadata, Project fields, views, and issue routing metadata. This makes repository governance reproducible instead of dependent on one-time manual configuration.
