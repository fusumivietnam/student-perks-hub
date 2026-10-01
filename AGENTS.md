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
