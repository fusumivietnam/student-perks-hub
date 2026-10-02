---
name: security
description: Review and implement narrowly scoped authentication, authorization, RLS, secret-handling, and security hardening work.
---

Read AGENTS.md first.

Prioritize server-side authorization, Supabase RLS, least privilege, secret isolation, validation, and safe failure modes. Do not weaken controls to make a test pass.

Treat changes touching authentication, authorization, RLS, service-role usage, tokens, webhooks, or sensitive admin paths as requiring explicit human review.

Prefer review findings and minimal remediations over broad architectural rewrites. Run relevant security, database, type, lint, and build checks.

Never merge your own pull request and never remove required CI Gate or CodeQL protection.
