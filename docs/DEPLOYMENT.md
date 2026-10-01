# Deployment

Student Perks Hub is provider-neutral. Production infrastructure is not selected
by this repository; deployment should preserve the same Next.js + Supabase
security model used locally.

## Required environment

Configure these values in the deployment platform's encrypted environment or
secret store. Do not commit production values to Git.

- `NEXT_PUBLIC_SITE_URL` — canonical HTTPS origin of the deployed site.
- `NEXT_PUBLIC_SUPABASE_URL` — public Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable client key.

`SUPABASE_INTERNAL_URL` is optional. Use it only when the server runtime has a
private/internal route to Supabase that differs from the public URL.

Never expose a Supabase secret/service-role key to browser code. Admin
authorization in this application uses database-backed memberships and RLS; it
does not require a service-role credential in ordinary application requests.

## Database deployment

Local development remains independent from a remote project. When a production
Supabase project is selected:

1. review all committed migrations in `supabase/migrations/`;
2. link the CLI to the intended project outside the application runtime;
3. apply reviewed migrations through a controlled deployment step;
4. regenerate/compare database types if the schema changes;
5. run database authorization/RLS tests before promoting the release.

Do not make production-only schema edits through Studio without committing an
equivalent migration and declarative schema update.

## Pre-deploy verification

Run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm build
pnpm db:reset
pnpm db:test
pnpm db:types
git diff --exit-code -- lib/database.types.ts
```

Critical browser flows are covered by the Playwright suite once dependencies are
installed with the committed lockfile.

## GitHub environments

Use separate Preview and Production environments when deployment automation is
added. Store environment-specific values there or in the selected hosting
platform's encrypted configuration. Production deployment should require the
same repository checks as `main`: CI Gate and CodeQL.

## Rollback

Application rollback should redeploy the last known-good application revision.
Database migrations require a reviewed forward-fix or an explicitly designed
rollback; do not assume a destructive automatic database rollback is safe.
