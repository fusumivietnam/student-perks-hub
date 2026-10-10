begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, auth;

select plan(12);

insert into auth.users (id, email)
values
  ('33333333-3333-3333-3333-333333333333'::uuid, 'member-product@example.com'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'admin-product@example.com');

insert into public.admin_memberships (user_id)
values ('44444444-4444-4444-4444-444444444444'::uuid);

insert into public.categories (id, slug, name)
values (
  'abababab-abab-abab-abab-abababababab'::uuid,
  'product-completeness',
  'Product completeness'
);

insert into public.submissions (
  id,
  submitter_user_id,
  provider,
  title,
  official_url,
  description
)
values (
  '55555555-5555-5555-5555-555555555555'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Example Provider',
  'Example student offer',
  'HTTPS://Example.COM/student-offer/',
  'A useful student discount from the official provider.'
);

select is(
  (select normalized_official_url from public.submissions where id = '55555555-5555-5555-5555-555555555555'::uuid),
  'https://example.com/student-offer'::text,
  'official URL normalization is deterministic'
);

select throws_ok(
  $$insert into public.submissions (provider, title, official_url)
    values ('Duplicate', 'Duplicate active submission', 'https://example.com/student-offer')$$,
  '23505',
  null,
  'duplicate active official URL is rejected'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

select is(
  public.cancel_own_submission('55555555-5555-5555-5555-555555555555'::uuid),
  true,
  'submitter can cancel own pending submission'
);

select is(
  (select status from public.submissions where id = '55555555-5555-5555-5555-555555555555'::uuid),
  'cancelled'::text,
  'cancelled status persists'
);

reset role;

select lives_ok(
  $$insert into public.submissions (
      id, submitter_user_id, provider, title, official_url, description
    ) values (
      '66666666-6666-6666-6666-666666666666'::uuid,
      '33333333-3333-3333-3333-333333333333'::uuid,
      'Example Provider',
      'Replacement student offer',
      'https://example.com/student-offer',
      'Replacement after cancellation.'
    )$$,
  'cancelled submission releases the URL for a replacement'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

select throws_ok(
  $$select public.review_submission(
      '66666666-6666-6666-6666-666666666666'::uuid,
      'approved',
      'member should not review'
    )$$,
  '42501',
  null,
  'regular member cannot invoke admin review'
);

set local "request.jwt.claim.sub" = '44444444-4444-4444-4444-444444444444';

select is(
  public.review_submission(
    '66666666-6666-6666-6666-666666666666'::uuid,
    'approved',
    'Official source checked.'
  ),
  true,
  'admin can approve a pending submission'
);

select is(
  public.review_submission(
    '66666666-6666-6666-6666-666666666666'::uuid,
    'rejected',
    'stale second review'
  ),
  false,
  'second review is rejected by compare-and-set semantics'
);

select is(
  (select review_note from public.submissions where id = '66666666-6666-6666-6666-666666666666'::uuid),
  'Official source checked.'::text,
  'review note remains attached to the approved submission'
);

select lives_ok(
  $$select public.create_draft_offer_from_submission(
      '66666666-6666-6666-6666-666666666666'::uuid,
      'replacement-student-offer',
      'abababab-abab-abab-abab-abababababab'::uuid
    )$$,
  'approved submission converts to a draft offer'
);

select is(
  (select status from public.offers where source_submission_id = '66666666-6666-6666-6666-666666666666'::uuid),
  'draft'::text,
  'converted offer remains draft until explicit publication'
);

select is(
  (select count(*) from public.offers where source_submission_id = '66666666-6666-6666-6666-666666666666'::uuid),
  1::bigint,
  'submission maps to at most one offer'
);

select * from finish();
rollback;
