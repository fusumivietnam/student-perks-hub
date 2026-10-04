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

drop policy if exists "categories_admin_insert" on public.categories;
drop policy if exists "categories_admin_update" on public.categories;
drop policy if exists "categories_admin_delete" on public.categories;
drop policy if exists "offers_admin_select_all" on public.offers;
drop policy if exists "offers_admin_insert" on public.offers;
drop policy if exists "offers_admin_update" on public.offers;
drop policy if exists "offers_admin_delete" on public.offers;
drop policy if exists "submissions_admin_select_all" on public.submissions;
drop policy if exists "submissions_admin_update" on public.submissions;

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

create policy "offers_admin_select_all"
on public.offers
for select
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

create policy "submissions_admin_select_all"
on public.submissions
for select
to authenticated
using ((select private.is_admin()));

create policy "submissions_admin_update"
on public.submissions
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke all on function public.is_admin() from public, anon, authenticated;
drop function public.is_admin();
