# Admin authorization

Student Perks Hub uses a database-backed admin membership model.

## Source of truth

`public.admin_memberships` is the only application-level source of admin
authorization.

- membership is keyed by `auth.users.id`
- the only current role is `admin`
- authenticated users may read only their own membership row
- authenticated users cannot insert, update, or delete membership rows
- anonymous users have no access

Do not infer admin access from:

- client state
- cookies created by application code
- query parameters
- localStorage
- `user_metadata`
- email/domain naming conventions

## Provisioning

Admin membership must be provisioned out of band by a trusted database operator
or future privileged deployment workflow. The application must never expose a
self-service "make me admin" mutation.

Example operator-side SQL:

```sql
insert into public.admin_memberships (user_id)
values ('<auth-user-uuid>')
on conflict (user_id) do nothing;
```

Do not put a service-role key in browser code or ordinary application actions.

## Server authorization

Use `getCurrentAdmin()` from `lib/admin.ts` before implementing admin routes
or mutations. A hidden UI control is not authorization.

Future admin CRUD also requires explicit RLS/grants for the affected tables.
Passing `getCurrentAdmin()` alone does not bypass PostgreSQL RLS.

## Tests

`supabase/tests/database/admin_authorization.test.sql` verifies:

- the membership table exists
- RLS is enabled
- an admin can read their own membership
- a different authenticated identity cannot read that membership
- authenticated users cannot self-provision membership

Database CI runs `pnpm db:test` after a clean `pnpm db:reset`.
