# Concept F — design-first implementation contract

**Status:** Selected direction; visual acceptance **PENDING**. This document is the handoff contract, not proof that the Figma mockups are approved pixel-for-pixel.

**Master Figma:** https://www.figma.com/design/Q9VZWmuVLmv0ZyhjkS1mnN

**Direction:** Playful Modular. Purple-first branded Public experience; restrained data-dense Admin with navy sidebar, shared type, spacing, colors, form controls, and semantic statuses. No unapproved layout variations.

## Governance and ownership

1. Figma is the *intended* visual source of truth **after visual sign-off**. Before sign-off, treat every frame as a proposal, not an instruction to bulk rewrite the app.
2. `app/globals.css` owns runtime CSS tokens; `components/ui/*` owns reusable primitives; `lib/ui-config.ts` owns nonsecret product copy/config; Supabase owns data authorization and state.
3. **No blind sync from Figma to code.** Match approved frames using reviewable PRs. Preserve Next.js routes, authentic data, server actions, permissions, published/draft/archive states, and database migration discipline.
4. Design-only change requests must not introduce fictional KPIs, analytics, student-ID scans, uploads, editorial CMS, new settings, or publishing operations. Placeholder content in Figma is labeled exploratory.
5. Keep the existing 3-page Figma structure under Starter: Foundations & Components, Public Screens, Admin Screens. Prioritize batching Figma edits, component instances and reusable variants before creating more screens.

## Calibration gate — first two screens

- **Public homepage:** desktop 1440px and mobile 375px; actual hero, search, category navigation, published offer cards, empty state; check image rights/source and mobile scroll/navigation.
- **Admin dashboard:** desktop 1440px and mobile 375px; real dashboard counters, action routes, navy sidebar/mobile nav, loading/empty/error, overflow and density. Do not show a fake chart.
- Deliver for each: a Figma frame link, actual Preview screenshot link, a side-by-side comparison, deviations list and explicit user approval.
- **Decision rule:** if either is not approved, continue iterating on the pair **without spreading new styling across other routes**.

## Tokens proposed by Concept F (not activated in app yet)

| Role | Figma proposal | Existing runtime authority |
| --- | --- | --- |
| Brand primary | `#743AFF` | `--primary` in `app/globals.css` |
| Brand secondary | `#FF3985` | new semantic token only when required and approved |
| Success | `#12B886` | semantic status tokens / Badge |
| Warning | `#FF9F1C` | semantic status tokens / Badge |
| Admin navy | `#0B1742` | sidebar surface token |
| Main foreground | `#0B1742` | `--foreground` |
| Surface | `#F8F7FC` | `--background` / surfaces |

Use these as **proposals**, not direct global replacement values. Contrast, focus, hover, pressed and error states need explicit checks. Scale proposal: Inter; spacing 4/8/12/16/24/32/48; radii 8/12/16/24. Avoid hardcoded one-off page styles.

## Component mapping and implementation order

| Figma role | Existing code | Acceptance |
| --- | --- | --- |
| Primary / secondary / destructive actions | `components/ui/button.tsx` | all variants + keyboard focus |
| Form fields | `components/ui/input.tsx`, `select.tsx`, `textarea.tsx` | labels, errors, mobile |
| Cards, offer cards | `components/ui/card.tsx`, `components/offers/offer-card.tsx` | real content / image handling |
| State badges | `components/ui/badge.tsx` | map real DB states; do not rely on color only |
| Admin tables | `components/ui/table.tsx` | responsive cells and action semantics |
| Navigation / shells | existing app layout + Admin shell | no duplicate site chrome |

**Implementation sequence:** (1) calibrate and approve Homepage + Dashboard; (2) tokens/primitives in one cohesive PR; (3) complete Public template family; (4) complete Admin template family; (5) route-by-route functional and visual audit; (6) protected release. No parallel one-off visual patch PRs.

## Evidence and release gates

- CI and CodeQL must pass. E2E screenshot artifacts at 1440px and 375px are *evidence only*, not visual acceptance.
- Preview screenshots must represent the deployed branch and authenticated Admin, without weakening preview protection. The original Figma imagery is not to be replaced with unrelated stock photography.
- Every UI PR records **Figma frame**, **Preview URL**, **desktop/mobile screenshot references**, **observed mismatches**, **a11y** and **owner sign-off**. A missing item remains **PENDING**, not implicitly passed.
- Keep Production unchanged until the explicitly protected release process is invoked.

## Current blockers (recorded 24 October 2026)

- Figma Starter MCP tool-call limit was encountered. Do not retry expensive write operations just to consume the same limit or claim a completed Figma library. Use existing master file and batch future work.
- Current Figma file contains editable reference frames and starter components, but not yet production-grade Auto Layout/variants/fully validated layouts. Additional visual calibration remains.
- No actual Figma-to-Preview side-by-side approval has been recorded yet.
