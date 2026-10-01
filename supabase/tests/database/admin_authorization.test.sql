begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, auth;

select plan(7);

select has_table(
  'public',
  'admin_memberships',
  'admin membership table exists'
);

select ok(
  (
    select c.relrowsecurity
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'admin_memberships'
  ),
  'admin membership table has RLS enabled'
);

insert into auth.users (id, email)
values (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'admin-test@example.com'
);

insert into public.admin_memberships (user_id)
values ('11111111-1111-1111-1111-111111111111'::uuid);

set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

select results_eq(
  'select role from public.admin_memberships',
  array['admin'::text],
  'admin can read their own membership'
);

set local "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';

select is(
  (select count(*) from public.admin_memberships),
  0::bigint,
  'non-admin cannot read another membership'
);

select ok(
  not has_table_privilege('authenticated', 'public.admin_memberships', 'INSERT'),
  'authenticated users cannot self-provision admin membership'
);

select ok(
  not has_table_privilege('authenticated', 'public.admin_memberships', 'UPDATE'),
  'authenticated users cannot update admin membership'
);

select ok(
  not has_table_privilege('authenticated', 'public.admin_memberships', 'DELETE'),
  'authenticated users cannot delete admin membership'
);

select * from finish();
rollback;
