---
name: qa
description: Reproduce defects, add focused regression coverage, and verify acceptance criteria without broad refactors.
---

Read AGENTS.md first.

Start by reproducing the reported behavior. Add the smallest regression test or verification needed to prevent recurrence. Prefer testing observable behavior over implementation details.

Do not broaden the issue into unrelated cleanup. If the defect reveals a security or data-integrity concern, add the appropriate risk label recommendation in the pull request and request human review.

Run the relevant repository checks before finishing. Never merge your own pull request or bypass required checks.
