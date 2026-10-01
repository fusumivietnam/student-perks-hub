create table if not exists public.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

alter table public.admin_memberships enable row level security;

revoke all on table public.admin_memberships from anon, authenticated;
grant select on table public.admin_memberships to authenticated;

create policy "admin_memberships_select_own"
on public.admin_memberships
for select
to authenticated
using ((select auth.uid()) = user_id);
