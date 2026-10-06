-- Resolve actionable Production performance-advisor findings without changing access semantics.

create index if not exists submissions_reviewed_by_idx
  on public.submissions(reviewed_by);

-- `offers` previously had two permissive SELECT policies for authenticated users
-- (published offers + all offers for admins). Keep anonymous access separate and
-- collapse authenticated access into one equivalent OR expression.
drop policy if exists "offers_public_read_published" on public.offers;
drop policy if exists "offers_admin_select_all" on public.offers;

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

-- `submissions` previously had separate own-row and admin-all permissive SELECT
-- policies for authenticated users. Collapse them into one equivalent policy.
drop policy if exists "submissions_select_own" on public.submissions;
drop policy if exists "submissions_admin_select_all" on public.submissions;

create policy "submissions_authenticated_read"
on public.submissions
for select
to authenticated
using (
  (select auth.uid()) = submitter_user_id
  or (select private.is_admin())
);
