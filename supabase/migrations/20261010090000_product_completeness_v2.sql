-- Product completeness v2: submission lifecycle, duplicate prevention, user cancellation,
-- admin review CAS, and traceable conversion from approved submissions to draft offers.

alter table public.submissions
  add column if not exists normalized_official_url text
  generated always as (lower(regexp_replace(btrim(official_url), '/+$', ''))) stored,
  add column if not exists review_note text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.submissions
  drop constraint if exists submissions_status_check;

alter table public.submissions
  add constraint submissions_status_check
  check (status in ('pending', 'approved', 'rejected', 'cancelled'));

create unique index if not exists submissions_open_official_url_uidx
  on public.submissions(normalized_official_url)
  where status in ('pending', 'approved');

alter table public.offers
  add column if not exists source_submission_id uuid
  references public.submissions(id) on delete set null;

create unique index if not exists offers_source_submission_id_uidx
  on public.offers(source_submission_id)
  where source_submission_id is not null;

revoke update on table public.submissions from authenticated;

create or replace function private.cancel_own_submission(p_submission_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer;
begin
  if (select auth.uid()) is null then
    return false;
  end if;

  update public.submissions
  set status = 'cancelled',
      updated_at = now()
  where id = p_submission_id
    and submitter_user_id = (select auth.uid())
    and status = 'pending';

  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

revoke all on function private.cancel_own_submission(uuid) from public, anon;
grant execute on function private.cancel_own_submission(uuid) to authenticated;

create or replace function public.cancel_own_submission(p_submission_id uuid)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.cancel_own_submission(p_submission_id);
$$;

revoke all on function public.cancel_own_submission(uuid) from public, anon;
grant execute on function public.cancel_own_submission(uuid) to authenticated;

create or replace function private.review_submission(
  p_submission_id uuid,
  p_status text,
  p_review_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer;
begin
  if not (select private.is_admin()) then
    raise exception 'admin authorization required' using errcode = '42501';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'invalid review status' using errcode = '22023';
  end if;

  update public.submissions
  set status = p_status,
      review_note = nullif(btrim(p_review_note), ''),
      reviewed_by = (select auth.uid()),
      reviewed_at = now(),
      updated_at = now()
  where id = p_submission_id
    and status = 'pending';

  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

revoke all on function private.review_submission(uuid, text, text) from public, anon;
grant execute on function private.review_submission(uuid, text, text) to authenticated;

create or replace function public.review_submission(
  p_submission_id uuid,
  p_status text,
  p_review_note text default null
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.review_submission(p_submission_id, p_status, p_review_note);
$$;

revoke all on function public.review_submission(uuid, text, text) from public, anon;
grant execute on function public.review_submission(uuid, text, text) to authenticated;

create or replace function private.create_draft_offer_from_submission(
  p_submission_id uuid,
  p_slug text,
  p_category_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  source_row public.submissions%rowtype;
  existing_offer_id uuid;
  created_offer_id uuid;
begin
  if not (select private.is_admin()) then
    raise exception 'admin authorization required' using errcode = '42501';
  end if;

  if p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'invalid offer slug' using errcode = '22023';
  end if;

  select id
  into existing_offer_id
  from public.offers
  where source_submission_id = p_submission_id;

  if existing_offer_id is not null then
    return existing_offer_id;
  end if;

  select *
  into source_row
  from public.submissions
  where id = p_submission_id
    and status = 'approved'
  for update;

  if source_row.id is null then
    raise exception 'submission must be approved before draft creation' using errcode = '22023';
  end if;

  insert into public.offers (
    slug,
    title,
    provider,
    summary,
    description,
    official_url,
    category_id,
    benefit_type,
    status,
    source_submission_id,
    updated_at
  ) values (
    p_slug,
    source_row.title,
    source_row.provider,
    left(coalesce(nullif(source_row.description, ''), source_row.title), 500),
    source_row.description,
    source_row.official_url,
    p_category_id,
    'other',
    'draft',
    source_row.id,
    now()
  )
  returning id into created_offer_id;

  return created_offer_id;
end;
$$;

revoke all on function private.create_draft_offer_from_submission(uuid, text, uuid) from public, anon;
grant execute on function private.create_draft_offer_from_submission(uuid, text, uuid) to authenticated;

create or replace function public.create_draft_offer_from_submission(
  p_submission_id uuid,
  p_slug text,
  p_category_id uuid default null
)
returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.create_draft_offer_from_submission(
    p_submission_id,
    p_slug,
    p_category_id
  );
$$;

revoke all on function public.create_draft_offer_from_submission(uuid, text, uuid) from public, anon;
grant execute on function public.create_draft_offer_from_submission(uuid, text, uuid) to authenticated;
