grant insert, update, delete on table public.categories to authenticated;
grant insert, update, delete on table public.offers to authenticated;
grant update on table public.submissions to authenticated;

create or replace function public.is_admin()
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

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create policy "categories_admin_insert"
on public.categories
for insert
to authenticated
with check ((select public.is_admin()));

create policy "categories_admin_update"
on public.categories
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "categories_admin_delete"
on public.categories
for delete
to authenticated
using ((select public.is_admin()));

create policy "offers_admin_select_all"
on public.offers
for select
to authenticated
using ((select public.is_admin()));

create policy "offers_admin_insert"
on public.offers
for insert
to authenticated
with check ((select public.is_admin()));

create policy "offers_admin_update"
on public.offers
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "offers_admin_delete"
on public.offers
for delete
to authenticated
using ((select public.is_admin()));

create policy "submissions_admin_select_all"
on public.submissions
for select
to authenticated
using ((select public.is_admin()));

create policy "submissions_admin_update"
on public.submissions
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
