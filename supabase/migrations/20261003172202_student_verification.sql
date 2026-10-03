create table if not exists public.student_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  verification_email text not null check (char_length(verification_email) between 3 and 254),
  institution_name text not null check (char_length(institution_name) between 2 and 200),
  status text not null default 'pending' check (
    status in ('pending', 'verified', 'rejected', 'expired')
  ),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'verified' or expires_at is not null)
);

create index if not exists student_verifications_user_id_idx
  on public.student_verifications(user_id, created_at desc);

create unique index if not exists student_verifications_one_active_per_user_idx
  on public.student_verifications(user_id)
  where status in ('pending', 'verified');

alter table public.student_verifications enable row level security;

revoke all on table public.student_verifications from anon, authenticated;

grant select on table public.student_verifications to authenticated;
grant insert (user_id, verification_email, institution_name)
  on table public.student_verifications to authenticated;
grant update (status, reviewed_by, reviewed_at, expires_at, updated_at)
  on table public.student_verifications to authenticated;

create policy "student_verifications_select_own"
on public.student_verifications
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "student_verifications_insert_own"
on public.student_verifications
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and verification_email = (select auth.jwt() ->> 'email')
);

create policy "student_verifications_admin_select_all"
on public.student_verifications
for select
to authenticated
using ((select public.is_admin()));

create policy "student_verifications_admin_update"
on public.student_verifications
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
