-- Keep auth.jwt() as a statement-level initplan inside the INSERT policy.
-- This preserves the existing account-email ownership check while avoiding
-- per-row JWT re-evaluation reported by the Supabase Performance Advisor.

drop policy if exists "student_verifications_insert_own"
  on public.student_verifications;

create policy "student_verifications_insert_own"
on public.student_verifications
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and lower(verification_email) = lower((select auth.jwt()) ->> 'email')
  and not (select private.has_active_student_verification((select auth.uid())))
);
