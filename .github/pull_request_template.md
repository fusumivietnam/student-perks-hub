## Outcome

Describe the complete vertical-slice outcome of this PR.

## Issue / objective

Closes #

## Included scope

- [ ] Implementation, tests, docs and operational metadata that belong to this objective are included together.
- [ ] The PR avoids unrelated refactors or speculative abstractions.
- [ ] A separate follow-up PR is only required where there is a real risk, rollback, ownership or review boundary.

## Risk boundaries

Describe database, security, recovery, deployment or rollback implications. State `none` when not applicable.

## Verification

- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Relevant user flow tested
- [ ] Database reset/type generation checked if `supabase/**` changed
- [ ] Relevant browser, recovery or operational gate ran when affected

## Delivery batch review

- [ ] This PR is a cohesive batch rather than a micro-PR created only because of tool/file boundaries.
- [ ] CI fixes discovered before merge stay on this branch/PR.
- [ ] Security, authorization, validation, accessibility, data integrity and recovery controls were not weakened for speed.

## Concept F visual acceptance (UI changes)
- [ ] Concept F calibration screens approved, or this PR is limited to design governance/testing with no visual migration.
- [ ] Figma frame/node references and authenticated Preview URL listed.
- [ ] Actual desktop 1440px and mobile 375px screenshots attached (CI local screenshots alone do not qualify).
- [ ] Deviations, accessibility states, and explicit **VISUAL ACCEPTED / PENDING** decision recorded.
- [ ] No unapproved UI feature or invented data introduced.

## Legacy approved concept criteria (historical; superseded by Concept F once signed off)
- [ ] Existing components and configuration reviewed; no unnecessary duplicate primitive.
- [ ] Real Preview screenshots attached at 1440px and 375px, compared with docs/APPROVED_UI_CONCEPT.md.
- [ ] Visual acceptance marked pending until screenshots have been reviewed; any deviations explained.

## Shared UX/UI alignment (when modifying frontend or admin)
- [ ] Compare desktop and 375px mobile views against docs/DESIGN_SYSTEM.md and approved mockup.
- [ ] Use real data/capabilities only; preserve responsive, keyboard and empty/error behaviors.
- [ ] Record intentional deviations from visual mockup.

## Admin UI alignment (when modifying /admin)
- [ ] Matches docs/ADMIN_UI.md patterns and references the approved Admin UI mockup.
- [ ] States loading, empty, error and success behaviors for the affected route.
- [ ] Checks mobile layout, keyboard access, form labels and status semantics.
- [ ] Keeps existing admin/RLS authorization and moderation state transitions unchanged unless explicitly reviewed.

## Release impact

- [ ] No Production release required
- [ ] Include in the next release train
- [ ] Urgent protected Production release required
