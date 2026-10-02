# Environment model

Student Perks Hub uses three logical environments. Provider-specific configuration may vary, but these responsibilities must stay separate.

| Environment | Purpose | Data | Deployment |
| --- | --- | --- | --- |
| Local | development and database iteration | disposable local Supabase | developer machine / Codespaces |
| Preview | pull-request verification | isolated non-production data | per-PR or shared preview |
| Production | public service | production Supabase | protected production deployment |

## Local

Local development is fully reproducible from the repository:

- `pnpm local:start`
- `pnpm db:reset`
- `pnpm db:test`
- `pnpm db:types`
- `pnpm dev`

Local development must never require production credentials.

## Preview

Preview must use non-production credentials and non-production data.

Required configuration:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- optional `SUPABASE_INTERNAL_URL` when the hosting topology needs a private server-side endpoint

Preview deployments must not reuse the production service-role key or production database.

## Production

Production deployment requires:

1. CI Gate and CodeQL green on the exact commit.
2. Reviewed database migrations.
3. A protected deployment environment.
4. Production secrets stored only in the deployment platform / GitHub Environment.
5. A rollback path confirmed before deployment.
6. Smoke checks after deployment.

## Secret ownership

Never commit environment secrets. Public browser keys may be exposed only when they are explicitly designed to be public; service-role credentials remain server-only.

Production secrets must be rotated when exposure is suspected. Record the event in the incident process.

## Promotion model

Promote the same reviewed source commit through environments whenever the deployment platform supports it:

```text
PR → Preview → main → Production
```

Do not rebuild from an unrelated branch for production.
