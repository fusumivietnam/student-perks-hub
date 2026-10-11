begin;

create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public, auth;

select plan(10);

insert into auth.users (id, email)
values
  ('77777777-7777-7777-7777-777777777777'::uuid, 'member-freshness@example.com'),
  ('88888888-8888-8888-8888-888888888888'::uuid, 'admin-freshness@example.com');

insert into public.admin_memberships (user_id)
values ('88888888-8888-8888-8888-888888888888'::uuid);

insert into public.offers (
  id, slug, title, provider, summary, official_url, benefit_type, status
)
values (
  '99999999-9999-9999-9999-999999999999'::uuid,
  'freshness-test-offer',
  'Freshness test offer',
  'Example Provider',
  'A test offer used to validate the freshness pipeline.',
  'https://example.com/student-offer',
  'discount',
  'published'
);

select throws_ok(
  $$insert into public.offers (
      slug, title, provider, summary, official_url, benefit_type, status
    ) values (
      'insecure-offer',
      'Insecure offer',
      'Example Provider',
      'This should fail because the official URL is not HTTPS.',
      'http://example.com/insecure',
      'discount',
      'draft'
    )$$,
  '23514',
  null,
  'official offer URLs must use HTTPS'
);

set local role authenticated;
set local "request.jwt.claim.sub" = '77777777-7777-7777-7777-777777777777';

select throws_ok(
  $$select public.verify_offer(
      '99999999-9999-9999-9999-999999999999'::uuid,
      'member should not verify',
      null,
      90
    )$$,
  '42501',
  null,
  'regular member cannot reverify an offer'
);

set local "request.jwt.claim.sub" = '88888888-8888-8888-8888-888888888888';

select is(
  public.verify_offer(
    '99999999-9999-9999-9999-999999999999'::uuid,
    'Official page checked and benefit confirmed.',
    now() + interval '30 days',
    60
  ),
  true,
  'admin can verify an active offer'
);

select ok(
  (select last_verified_at is not null from public.offers where id = '99999999-9999-9999-9999-999999999999'::uuid),
  'verification timestamp is recorded'
);

select is(
  (select verified_by from public.offers where id = '99999999-9999-9999-9999-999999999999'::uuid),
  '88888888-8888-8888-8888-888888888888'::uuid,
  'admin identity is recorded'
);

select is(
  (select verification_interval_days from public.offers where id = '99999999-9999-9999-9999-999999999999'::uuid),
  60,
  'verification cadence is persisted'
);

select is(
  (select verification_note from public.offers where id = '99999999-9999-9999-9999-999999999999'::uuid),
  'Official page checked and benefit confirmed.'::text,
  'verification note is persisted'
);

select throws_ok(
  $$select public.verify_offer(
      '99999999-9999-9999-9999-999999999999'::uuid,
      null,
      null,
      0
    )$$,
  '22023',
  null,
  'invalid verification cadence is rejected'
);

select throws_ok(
  $$select public.verify_offer(
      '99999999-9999-9999-9999-999999999999'::uuid,
      null,
      now() - interval '1 day',
      90
    )$$,
  '22023',
  null,
  'verification cannot record an already-expired offer as valid'
);

reset role;
update public.offers
set expires_at = now() - interval '1 minute'
where id = '99999999-9999-9999-9999-999999999999'::uuid;

set local role anon;
select is(
  (select count(*) from public.offers where id = '99999999-9999-9999-9999-999999999999'::uuid),
  0::bigint,
  'expired offers are hidden from public readers even before lifecycle status is changed'
);

select * from finish();
rollback;
