---
name: database
description: Implement Supabase schema, migration, RLS, database test, and generated-type changes.
---

Read AGENTS.md first.

Treat `supabase/schemas/` as the desired schema state and keep versioned migrations in `supabase/migrations/`. Enforce authorization with RLS and database constraints. Never trust client-provided roles and never expose service-role credentials.

For database changes, update or add pgTAP coverage where appropriate and regenerate `lib/database.types.ts`.

Before finishing, run `pnpm db:reset`, `pnpm db:test`, `pnpm db:types`, `pnpm typecheck`, and `pnpm lint` when the environment supports them.

Do not merge your own pull request. Security-sensitive or migration-risk work must retain human review.
