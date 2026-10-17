# Project status

This file is a **stable live-status index**, not a manually maintained snapshot. GitHub is the source of truth for execution state so repository Markdown cannot drift behind active work.

## Live views

- [Open pull requests](https://github.com/fusumivietnam/student-perks-hub/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc)
- [Recently merged pull requests](https://github.com/fusumivietnam/student-perks-hub/pulls?q=is%3Apr+is%3Amerged+sort%3Aupdated-desc)
- [Open issues](https://github.com/fusumivietnam/student-perks-hub/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)
- [Actions](https://github.com/fusumivietnam/student-perks-hub/actions)
- [Projects](https://github.com/fusumivietnam/student-perks-hub/projects)
- [Main branch](https://github.com/fusumivietnam/student-perks-hub/commits/main)

## What belongs where

| Information | Canonical source |
| --- | --- |
| Current PR / active batch | Open pull requests / Project |
| Current `main` SHA | `main` branch |
| CI / CodeQL / workflow health | Actions / PR checks |
| Open blockers and human follow-ups | Issues |
| Completed implementation history | Merged PRs / Git history |
| Product sequencing and direction | [`ROADMAP.md`](./ROADMAP.md) |
| Delivery rules | [`DELIVERY_MODE.md`](./DELIVERY_MODE.md) |
| Release procedure | [`RELEASE_RUNBOOK.md`](./RELEASE_RUNBOOK.md) |
| Recovery procedure/evidence contract | Recovery docs and workflows |

## Anti-drift rule

Do **not** add any of the following to this file or the roadmap:

- a copied current SHA;
- a copied active PR number;
- a hand-maintained list of completed PRs;
- duplicated issue status;
- copied CI results or workflow run IDs;
- dated "current snapshot" sections.

If a fact can change because a PR merges, an issue closes, or a workflow reruns, read it from GitHub instead of copying it into tracked Markdown.

Tracked documentation should describe durable contracts, policies, architecture, procedures, or future direction. GitHub records mutable execution state and history.
