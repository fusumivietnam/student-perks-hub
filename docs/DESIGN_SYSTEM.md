# Student Perks Hub — shared UX/UI contract

Approved direction: reproduce the **structure, visual hierarchy, spacing and blue/white language** of the 18 October 2026 nine-screen mockup across Public Frontend and Admin. Adapt every screen to actual data, real capabilities and existing routes; the illustration is not a source for synthetic charts, logos, testimonials, savings percentages or analytics.

## Design tokens and patterns

- Use existing tokens in `app/globals.css`: primary blue, dark foreground, light neutral surfaces, visible focus. Avoid a competing stylesheet or a second design system.
- Desktop content container: `max-w-7xl`; mobile-first responsive grids; card surfaces with `rounded-2xl border bg-white`, light shadow only when meaningful.
- Navigation: public horizontal desktop nav and accessible mobile menu; Admin workspace sidebar and task-oriented navigation.
- Heading scale: a single H1 per page, H2 for sections; clear primary CTA; 44px minimum interactive touch targets and visible keyboard focus.
- Cards/badges: show trustworthy provider/title/category/status from records; imagery only from supported, licensed assets or genuine offer/provider sources. Always retain an accessible text fallback.
- States: meaningful loading, empty, error, success; no fake counts, speculative report graphs, settings, drag reorder, notifications, file uploads or features not backed by APIs.
- Core workflows first: discover → compare → offer detail → official link; admin review → draft → explicit publish, plus student verification and saved offers.
- A11y: semantic controls and labels, text alternatives, WCAG AA contrast, logical tab order, reduced-motion-aware transitions, overflow-safe layout.

## Screen-level acceptance

| Surface | Essential UX | Not permitted without a backed feature |
| --- | --- | --- |
| `/` | Bold blue-toned hero, immediately usable search, shortcuts to real categories and a clear featured offers grid | Dummy conversion/traffic counters, stock-photo claims about real students |
| `/offers`, `/search` | Filters, readable offer cards, stable pagination, mobile readability | Fabricated deals or discount values |
| `/offers/[slug]` | Clear provider, real benefit/conditions, official CTA, freshness context | Invented ratings, reviews or screenshots |
| Auth, account, saved, verification, submit | Short labeled forms, explicit status/errors, predictable return paths | Decorative controls without actions |
| Admin routes | Follow `ADMIN_UI.md` for task-centric queue, editor, statuses and operational rules | Speculative analytics, irreversible delete in normal UI |

## Review process

For each user-facing batch: compare with the approved mockup at desktop and 375px mobile, review focus/labels, meaningful states, existing data and routing, cover changed critical flows with tests, preserve CI/CodeQL/release gates. Reference this contract and any specific deviations in the existing PR checklist. Integrate useful external design-skill guidance **as reviewed documentation only**, never install or execute untrusted scripts in CI by default.

This is a stable specification, not a live execution status log. PRs and GitHub checks own delivery state.
