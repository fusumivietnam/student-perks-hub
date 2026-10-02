begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, auth;

select plan(11);

insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111'::uuid, 'admin-moderation@example.com'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'member-moderation@example.com');

insert into public.admin_memberships (user_id)
values ('11111111-1111-1111-1111-111111111111'::uuid);

insert into public.categories (id, slug, name)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'admin-test-category',
  'Admin test category'
);

insert into public.offers (
  id,
  slug,
  title,
  provider,
  summary,
  official_url,
  category_id,
  benefit_type,
  status
)
values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  'admin-test-draft',
  'Admin test draft',
  'Test provider',
  'Draft visible only to administrators.',
  'https://example.com/admin-test',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'free',
  'draft'
);

insert into public.submissions (
  id,
  submitter_user_id,
  provider,
  title,
  official_url,
  status
)
values (
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Submission provider',
  'Pending admin review',
  'https://example.com/submission',
  'pending'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '22222222-2222-2222-2222-222222222222';

select is(
  public.is_admin(),
  false,
  'regular authenticated user is not an admin'
);

select is(
  (select count(*) from public.offers where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid),
  0::bigint,
  'regular user cannot read draft offers'
);

select is(
  (select count(*) from public.submissions where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid),
  0::bigint,
  'regular user cannot read another user submission'
);

select results_eq(
  $$update public.offers
    set status = 'published'
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid
    returning id$$,
  $$values (null::uuid) limit 0$$,
  'regular user cannot mutate draft offers'
);

set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

select is(
  public.is_admin(),
  true,
  'admin membership resolves through is_admin'
);

select is(
  (select count(*) from public.offers where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid),
  1::bigint,
  'admin can read draft offers'
);

select is(
  (select count(*) from public.submissions where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid),
  1::bigint,
  'admin can read pending submissions'
);

select lives_ok(
  $$insert into public.categories (slug, name)
    values ('admin-created-category', 'Admin created category')$$,
  'admin can create categories'
);

select lives_ok(
  $$update public.offers
    set status = 'published', published_at = now()
    where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid$$,
  'admin can publish offers'
);

select lives_ok(
  $$update public.submissions
    set status = 'approved',
        reviewed_by = '11111111-1111-1111-1111-111111111111'::uuid,
        reviewed_at = now()
    where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid$$,
  'admin can review submissions'
);

select results_eq(
  $$select status from public.submissions
    where id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid$$,
  array['approved'::text],
  'reviewed submission persists approved state'
);

select * from finish();
rollback;
