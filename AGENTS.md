# Student Perks Hub Agent Rules

Read this file before editing the repository.

## Core rule

Use the smallest safe change that satisfies the stated requirement.

Follow Ponytail FULL:

1. Skip speculative requirements.
2. Reuse existing code and patterns.
3. Prefer platform/framework primitives.
4. Prefer already-installed dependencies.
5. Add dependencies only with concrete justification.
6. Write the minimum new code required.

Never simplify away security, validation, authorization, data integrity, accessibility, or critical error handling.

## Locked stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase PostgreSQL
- Supabase Auth
- @supabase/ssr
- Zod
- Lucide

Do not introduce an alternative framework, ORM, database, state manager, or component library unless a concrete requirement cannot be satisfied by the locked stack.

## Architecture

- Default to Server Components.
- Use Client Components only for browser interactivity.
- Read data in Server Components or focused query helpers.
- Use Server Actions for app mutations.
- Create Route Handlers only for callbacks, webhooks, public APIs, or machine-to-machine endpoints.
- Use URL search params for filters and pagination.
- Do not add global state management without demonstrated need.

## Dependencies

Before adding a package:
1. search the repo;
2. check browser/platform primitives;
3. check Next.js;
4. check Supabase;
5. check shadcn/Radix;
6. check installed packages.

If one of them solves the requirement, do not add the package.

## Context retrieval

Keep coding-agent context minimal and verifiable.

- For an unfamiliar concept, behavior, or implementation location, prefer `ccc search <concept>` when `ccc` is available. Use natural-language intent rather than guessing identifiers.
- Treat CocoIndex Code results as discovery hints only. Before editing, read the exact current file and surrounding lines from the working tree or GitHub source of truth.
- Use exact text/identifier search for known symbols, filenames, error messages, or literals; semantic search is not a replacement for deterministic grep.
- Use Understand Anything (`$understand`, `$understand-explain`, `$understand-domain`) for broad architecture, domains, onboarding, and knowledge-graph questions rather than duplicating that work with repeated semantic searches.
- Refresh CocoIndex after significant edits with `ccc index` or `ccc search --refresh ...`; consecutive searches do not need a refresh when the code has not changed.
- If CocoIndex is unavailable or fails, fall back to normal repository search without blocking the task.
- Never commit `.cocoindex_code/` artifacts and never add CocoIndex indexing to CI, Release, Supabase, or Production runtime.

See `docs/context-retrieval.md` for the Codespaces setup and operating model.

## Scope

Do not:
- refactor unrelated files;
- build future features;
- create generic repositories or service layers;
- create speculative abstractions;
- wrap stable framework APIs without clear benefit;
- add infrastructure not required by the task.

## Database and security

- Enforce authorization server-side and with Supabase RLS.
- Never expose service-role credentials.
- Prefer database constraints for data invariants.
- Never trust client-provided roles.

## Before finishing

Run:
- pnpm typecheck
- pnpm lint
- relevant tests or critical manual flow

Then inspect the diff and remove unnecessary code.

## Local development

Use the repository-managed Supabase CLI. Do not add a separate PostgreSQL Docker Compose stack.

Standard workflow:

- `pnpm local:start` starts the local Supabase stack and writes local environment files.
- `pnpm dev` starts Next.js.
- `pnpm db:reset` rebuilds the local database from committed migrations and seed data.
- `pnpm db:types` regenerates database TypeScript types.

The desired database state lives in `supabase/schemas/`. Keep versioned migrations in
`supabase/migrations/`. Do not make schema changes only through Studio.

In GitHub Codespaces, keep the Supabase API unexposed. Browser-side requests must use
the same-origin `/supabase/*` proxy; server-side code uses `SUPABASE_INTERNAL_URL`.

