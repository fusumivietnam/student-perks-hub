begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, auth;

select plan(10);

select has_table(
  'public',
  'student_verifications',
  'student verification table exists'
);

select ok(
  (
    select c.relrowsecurity
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'student_verifications'
  ),
  'student verification table has RLS enabled'
);

select ok(
  not has_table_privilege('anon', 'public.student_verifications', 'SELECT'),
  'anonymous users cannot read verification records'
);

select ok(
  not has_column_privilege('authenticated', 'public.student_verifications', 'status', 'INSERT'),
  'authenticated users cannot choose verification status on insert'
);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'admin-verification@example.com'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'student@example.edu'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'other@example.edu');

insert into public.admin_memberships (user_id)
values ('11111111-1111-1111-1111-111111111111'::uuid);

set local role authenticated;
set local "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","email":"student@example.edu","role":"authenticated"}';

insert into public.student_verifications (
  user_id,
  verification_email,
  institution_name
)
values (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'student@example.edu',
  'Example University'
);

select is(
  (select count(*) from public.student_verifications),
  1::bigint,
  'student can read their own verification request'
);

select throws_ok(
  $$
    insert into public.student_verifications (
      user_id,
      verification_email,
      institution_name
    ) values (
      '22222222-2222-2222-2222-222222222222'::uuid,
      'student@example.edu',
      'Second University'
    )
  $$,
  '23505',
  null,
  'student cannot create a second active verification request'
);

select results_eq(
  $$
    update public.student_verifications
    set status = 'verified',
        expires_at = now() + interval '1 year'
    returning status
  $$,
  array[]::text[],
  'student cannot self-approve verification'
);

set local "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';
set local "request.jwt.claims" = '{"sub":"33333333-3333-3333-3333-333333333333","email":"other@example.edu","role":"authenticated"}';

select is(
  (select count(*) from public.student_verifications),
  0::bigint,
  'another user cannot read the student verification request'
);

set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin-verification@example.com","role":"authenticated"}';

select is(
  (select count(*) from public.student_verifications),
  1::bigint,
  'admin can read verification requests'
);

update public.student_verifications
set status = 'verified',
    reviewed_by = '11111111-1111-1111-1111-111111111111'::uuid,
    reviewed_at = now(),
    expires_at = now() + interval '1 year',
    updated_at = now();

select results_eq(
  'select status from public.student_verifications',
  array['verified'::text],
  'admin can approve a verification request'
);

select * from finish();
rollback;
