begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, auth;

select plan(16);

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
  not has_column_privilege(
    'authenticated',
    'public.student_verifications',
    'status',
    'INSERT'
  ),
  'authenticated users cannot choose verification status on insert'
);

select has_index(
  'public',
  'student_verifications',
  'student_verifications_reviewed_by_idx',
  'reviewed_by foreign key has a covering index'
);

select has_index(
  'public',
  'student_verifications',
  'student_verifications_one_pending_per_user_idx',
  'one pending verification per user is uniqueness constrained'
);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'admin-verification@example.com'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'student@example.edu'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'other@example.edu'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'expired@example.edu');

insert into public.admin_memberships (user_id)
values ('11111111-1111-1111-1111-111111111111'::uuid);

insert into public.student_verifications (
  user_id,
  verification_email,
  institution_name,
  status,
  reviewed_by,
  reviewed_at,
  expires_at
)
values (
  '44444444-4444-4444-4444-444444444444'::uuid,
  'expired@example.edu',
  'Expired University',
  'verified',
  '11111111-1111-1111-1111-111111111111'::uuid,
  now() - interval '2 years',
  now() - interval '1 year'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';
set local "request.jwt.claims" = '{"sub":"22222222-2222-2222-2222-222222222222","email":"student@example.edu","role":"authenticated"}';

select lives_ok(
  $$insert into public.student_verifications (
      user_id,
      verification_email,
      institution_name
    ) values (
      '22222222-2222-2222-2222-222222222222'::uuid,
      'student@example.edu',
      'Example University'
    )$$,
  'student can create a request for their own account email'
);

select is(
  (select count(*) from public.student_verifications),
  1::bigint,
  'student can read only their own verification request'
);

select results_eq(
  $$update public.student_verifications
    set status = 'verified',
        reviewed_by = '22222222-2222-2222-2222-222222222222'::uuid,
        reviewed_at = now(),
        expires_at = now() + interval '1 year'
    where user_id = '22222222-2222-2222-2222-222222222222'::uuid
    returning id$$,
  $$values (null::uuid) limit 0$$,
  'student cannot self-approve verification'
);

select is(
  private.has_active_student_verification(
    '22222222-2222-2222-2222-222222222222'::uuid
  ),
  true,
  'pending request counts as active verification state'
);

set local "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';
set local "request.jwt.claims" = '{"sub":"33333333-3333-3333-3333-333333333333","email":"other@example.edu","role":"authenticated"}';

select is(
  (select count(*) from public.student_verifications),
  0::bigint,
  'another user cannot read student verification records'
);

set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin-verification@example.com","role":"authenticated"}';

select is(
  (select count(*) from public.student_verifications),
  2::bigint,
  'admin can read all verification records through consolidated SELECT policy'
);

select lives_ok(
  $$update public.student_verifications
    set status = 'verified',
        reviewed_by = '11111111-1111-1111-1111-111111111111'::uuid,
        reviewed_at = now(),
        expires_at = now() + interval '1 year',
        updated_at = now()
    where user_id = '22222222-2222-2222-2222-222222222222'::uuid$$,
  'admin can approve a pending verification for one year'
);

select results_eq(
  $$select status from public.student_verifications
    where user_id = '22222222-2222-2222-2222-222222222222'::uuid$$,
  array['verified'::text],
  'admin approval persists verified state'
);

select is(
  private.has_active_student_verification(
    '22222222-2222-2222-2222-222222222222'::uuid
  ),
  true,
  'unexpired verified record is active'
);

select is(
  private.has_active_student_verification(
    '44444444-4444-4444-4444-444444444444'::uuid
  ),
  false,
  'verified record becomes inactive when expires_at is in the past'
);

set local "request.jwt.claim.sub" = '44444444-4444-4444-4444-444444444444';
set local "request.jwt.claims" = '{"sub":"44444444-4444-4444-4444-444444444444","email":"expired@example.edu","role":"authenticated"}';

select lives_ok(
  $$insert into public.student_verifications (
      user_id,
      verification_email,
      institution_name
    ) values (
      '44444444-4444-4444-4444-444444444444'::uuid,
      'expired@example.edu',
      'Renewed University'
    )$$,
  'user can request verification again after a verified record expires by time'
);

select * from finish();
rollback;
