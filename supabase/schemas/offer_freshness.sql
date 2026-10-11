-- Declarative source for offer freshness controls introduced by the
-- 20261011010000_offer_freshness_pipeline migration.

alter table public.offers
  add column if not exists verification_interval_days integer not null default 90,
  add column if not exists expires_at timestamptz,
  add column if not exists verification_note text,
  add column if not exists verified_by uuid references auth.users(id) on delete set null;

alter table public.offers
  drop constraint if exists offers_verification_interval_days_check,
  add constraint offers_verification_interval_days_check
    check (verification_interval_days between 1 and 365),
  drop constraint if exists offers_official_url_https_check,
  add constraint offers_official_url_https_check
    check (official_url ~* '^https://');

create index if not exists offers_freshness_queue_idx
  on public.offers(status, last_verified_at)
  where status = 'published';

create index if not exists offers_verified_by_idx
  on public.offers(verified_by)
  where verified_by is not null;

create or replace function private.verify_offer(
  p_offer_id uuid,
  p_verification_note text default null,
  p_expires_at timestamptz default null,
  p_verification_interval_days integer default 90
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

  if p_verification_interval_days < 1 or p_verification_interval_days > 365 then
    raise exception 'verification interval must be between 1 and 365 days' using errcode = '22023';
  end if;

  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'verified offer expiry must be in the future' using errcode = '22023';
  end if;

  update public.offers
  set last_verified_at = now(),
      verification_note = nullif(btrim(p_verification_note), ''),
      verification_interval_days = p_verification_interval_days,
      expires_at = p_expires_at,
      verified_by = (select auth.uid()),
      updated_at = now()
  where id = p_offer_id
    and status in ('draft', 'published');

  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

revoke all on function private.verify_offer(uuid, text, timestamptz, integer) from public, anon;
grant execute on function private.verify_offer(uuid, text, timestamptz, integer) to authenticated;

create or replace function public.verify_offer(
  p_offer_id uuid,
  p_verification_note text default null,
  p_expires_at timestamptz default null,
  p_verification_interval_days integer default 90
)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  select private.verify_offer(
    p_offer_id,
    p_verification_note,
    p_expires_at,
    p_verification_interval_days
  );
$$;

revoke all on function public.verify_offer(uuid, text, timestamptz, integer) from public, anon;
grant execute on function public.verify_offer(uuid, text, timestamptz, integer) to authenticated;

drop policy if exists "offers_anon_read_published" on public.offers;
create policy "offers_anon_read_published"
on public.offers
for select
to anon
using (
  status = 'published'
  and (expires_at is null or expires_at > now())
);

drop policy if exists "offers_authenticated_read" on public.offers;
create policy "offers_authenticated_read"
on public.offers
for select
to authenticated
using (
  (
    status = 'published'
    and (expires_at is null or expires_at > now())
  )
  or (select private.is_admin())
);
