-- Student Perks Hub declarative schema.
-- This directory is the source of truth for database structure.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  provider text not null,
  summary text not null,
  description text,
  official_url text not null,
  logo_url text,
  category_id uuid references public.categories(id) on delete set null,
  benefit_type text not null check (
    benefit_type in ('free', 'discount', 'credit', 'trial', 'other')
  ),
  benefit_text text,
  eligibility text,
  how_to_claim text,
  audience text[] not null default '{}',
  tags text[] not null default '{}',
  status text not null default 'draft' check (
    status in ('draft', 'published', 'expired', 'archived')
  ),
  is_featured boolean not null default false,
  view_count bigint not null default 0 check (view_count >= 0),
  last_verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_category_id_idx
  on public.offers(category_id);
create index if not exists offers_public_listing_idx
  on public.offers(status, published_at desc);

create table if not exists public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, offer_id)
);

create index if not exists bookmarks_offer_id_idx
  on public.bookmarks(offer_id);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_user_id uuid references auth.users(id) on delete set null,
  provider text not null,
  title text not null,
  official_url text not null,
  description text,
  submitter_note text,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected')
  ),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists submissions_submitter_user_id_idx
  on public.submissions(submitter_user_id);
create index if not exists submissions_reviewed_by_idx
  on public.submissions(reviewed_by);

create table if not exists public.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_memberships
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.offers enable row level security;
alter table public.bookmarks enable row level security;
alter table public.submissions enable row level security;
alter table public.admin_memberships enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.categories from anon, authenticated;
revoke all on table public.offers from anon, authenticated;
revoke all on table public.bookmarks from anon, authenticated;
revoke all on table public.submissions from anon, authenticated;
revoke all on table public.admin_memberships from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url) on table public.profiles to authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.offers to anon, authenticated;
grant select, insert, delete on table public.bookmarks to authenticated;
grant insert on table public.submissions to anon, authenticated;
grant select on table public.submissions to authenticated;
grant select on table public.admin_memberships to authenticated;
grant insert, update, delete on table public.categories to authenticated;
grant insert, update, delete on table public.offers to authenticated;
grant update on table public.submissions to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "categories_public_read"
on public.categories
for select
to anon, authenticated
using (true);

create policy "offers_anon_read_published"
on public.offers
for select
to anon
using (status = 'published');

create policy "offers_authenticated_read"
on public.offers
for select
to authenticated
using (
  status = 'published'
  or (select private.is_admin())
);

create policy "bookmarks_select_own"
on public.bookmarks
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "bookmarks_insert_own"
on public.bookmarks
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "bookmarks_delete_own"
on public.bookmarks
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "submissions_insert"
on public.submissions
for insert
to anon, authenticated
with check (
  (
    (select auth.uid()) is null
    and submitter_user_id is null
  )
  or
  (
    (select auth.uid()) is not null
    and (select auth.uid()) = submitter_user_id
  )
);

create policy "submissions_authenticated_read"
on public.submissions
for select
to authenticated
using (
  (select auth.uid()) = submitter_user_id
  or (select private.is_admin())
);

create policy "admin_memberships_select_own"
on public.admin_memberships
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "categories_admin_insert"
on public.categories
for insert
to authenticated
with check ((select private.is_admin()));

create policy "categories_admin_update"
on public.categories
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "categories_admin_delete"
on public.categories
for delete
to authenticated
using ((select private.is_admin()));

create policy "offers_admin_insert"
on public.offers
for insert
to authenticated
with check ((select private.is_admin()));

create policy "offers_admin_update"
on public.offers
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "offers_admin_delete"
on public.offers
for delete
to authenticated
using ((select private.is_admin()));

create policy "submissions_admin_update"
on public.submissions
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
