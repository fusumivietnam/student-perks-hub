-- Privacy-first student verification.
-- The MVP stores only account email, institution name, review status, and timestamps.
-- No documents, student IDs, or personal images are stored.

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
  check (
    status <> 'verified'
    or (
      reviewed_by is not null
      and reviewed_at is not null
      and expires_at is not null
      and expires_at > reviewed_at
    )
  )
);

create index if not exists student_verifications_user_id_idx
  on public.student_verifications(user_id, created_at desc);

create index if not exists student_verifications_reviewed_by_idx
  on public.student_verifications(reviewed_by);

create unique index if not exists student_verifications_one_pending_per_user_idx
  on public.student_verifications(user_id)
  where status = 'pending';

create or replace function private.has_active_student_verification(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.student_verifications
    where user_id = target_user_id
      and (
        status = 'pending'
        or (status = 'verified' and expires_at > now())
      )
  );
$$;

revoke all on function private.has_active_student_verification(uuid) from public, anon;
grant execute on function private.has_active_student_verification(uuid) to authenticated;

alter table public.student_verifications enable row level security;

revoke all on table public.student_verifications from anon, authenticated;
grant select on table public.student_verifications to authenticated;
grant insert (user_id, verification_email, institution_name)
  on table public.student_verifications to authenticated;
grant update (status, reviewed_by, reviewed_at, expires_at, updated_at)
  on table public.student_verifications to authenticated;

create policy "student_verifications_authenticated_read"
on public.student_verifications
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or (select private.is_admin())
);

create policy "student_verifications_insert_own"
on public.student_verifications
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and lower(verification_email) = lower((select auth.jwt()) ->> 'email')
  and not (select private.has_active_student_verification((select auth.uid())))
);

create policy "student_verifications_admin_update"
on public.student_verifications
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));