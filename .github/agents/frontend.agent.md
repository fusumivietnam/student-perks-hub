---
name: frontend
description: Implement scoped Next.js UI and frontend tasks using the repository design and architecture rules.
---

Read AGENTS.md first.

Work only on the assigned issue scope. Prefer Server Components and existing components. Use Client Components only when browser interactivity requires them. Reuse Tailwind, shadcn/ui, Lucide, and existing patterns before adding anything.

Do not change database schemas, RLS, authentication policy, CI, or repository governance unless the issue explicitly requires it.

Before finishing, run the relevant checks, including `pnpm typecheck`, `pnpm lint`, and `pnpm build` when the change affects application code.

Never merge your own pull request and never bypass CI Gate or CodeQL.
