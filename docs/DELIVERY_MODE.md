# Fast delivery mode

Student Perks Hub uses a batched delivery model for routine post-launch work. The unit of delivery is a cohesive vertical slice, not an individual file or tiny implementation step.

## Default delivery shape

Prefer:

```text
objective / issue
  -> one implementation branch
  -> one cohesive batch
  -> one atomic commit when practical
  -> one pull request
  -> required CI + CodeQL + relevant domain gates
  -> auto-merge
  -> protected main
  -> release train when Production runtime changes justify a release
```

Avoid opening a new PR for documentation, tests, workflow updates, cleanup, or follow-up fixes that are directly required by the same objective. Keep those changes in the same PR unless they cross a real risk or ownership boundary.

## Batch sizing

A normal delivery batch should usually stay within these guidelines:

- one user-facing or operational objective;
- roughly 5–20 changed files when the work naturally spans that many files;
- roughly 300–1,200 changed lines as a soft range, not a hard quota;
- tests, documentation, workflow updates and migration metadata included with the implementation they validate;
- one to three tightly related technical goals.

Split work only when at least one of these is true:

- destructive or coordinated database migration requires independent recovery review;
- security-sensitive behavior needs isolated review;
- changes have independent rollback boundaries;
- two slices can ship independently and do not share acceptance criteria;
- the combined diff becomes materially harder to reason about than separate PRs.

## Commit policy

For automation-driven repository maintenance, prefer one atomic commit per delivery batch. If CI exposes a defect before merge, fix it on the existing branch and PR rather than opening a follow-up PR.

Multiple commits are acceptable when they materially improve reviewability, but micro-commits that only reflect tool operations should be avoided.

## Pull request policy

Every PR should describe:

- the complete outcome of the vertical slice;
- included scope and explicit exclusions;
- risk boundaries;
- verification performed;
- release impact.

Documentation and roadmap updates that belong to the same objective should ride in the same PR.

## CI policy

Keep protected-main safety gates intact while minimizing unnecessary work:

- docs/governance-only changes: lightweight repository checks only where supported;
- frontend changes: typecheck, lint, production build, plus browser/a11y/Lighthouse gates when affected;
- database changes: database/RLS validation and recovery-sensitive checks;
- recovery/operations changes: the relevant rehearsal/monitor workflow;
- release: full protected release gates.

Do not weaken CI Gate, CodeQL, migration fail-closed behavior, recovery fail-closed behavior, or protected-main rules for speed.

## Dependency policy

Dependabot runs weekly and groups related packages to reduce PR noise. Prefer a small number of coherent dependency batches rather than one PR per patch package. Framework/runtime, Supabase, UI/styling, tooling, and remaining low-risk packages are grouped separately so failures retain a useful fault domain.

## Release train

A merge to `main` does not automatically require a Production release. Batch multiple safe merges into one release candidate unless one of these applies:

- a user-facing fix is urgent;
- a database migration must be coordinated promptly;
- a security fix should ship immediately;
- an operational change is required to restore or protect Production.

The protected exact-SHA release workflow remains the only Production deployment control plane.
