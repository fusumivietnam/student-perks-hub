# Approved UI concept — 19 October 2026

The nine-screen **shadcn/ui-style concept** approved by the product owner supersedes the earlier blue/white collage for visual acceptance. Original image reference is in the approval conversation; when evaluating a PR, attach/reference the actual approved concept image, **not an approximate image search replacement**.

## Non-negotiable rules
1. **Reference-first**: reproduce layout, component hierarchy, spacing, sidebar, cards, tables, form grouping and navigation from the approved screens. Do not invent a different visual direction.
2. **Reuse-first**: inventory existing project components/routes, `components/ui`, `lib` and dependencies before adding anything. Prefer adapting an existing shadcn/ui primitive over custom copies.
3. **One system**: Next.js + Tailwind CSS v4 + shadcn/ui-style components. `app/globals.css` is the single styling-token authority. Use `components.json` for generator configuration and `components/ui` for shared primitives.
4. **Two shells, one design system**: Public discovery and Admin workspace use distinct layouts but the same typography, tokens, form controls and status semantics. Admin keeps navy sidebar.
5. **Truthful UI**: only show actual backend fields and enabled actions. The approved concept's screenshots with logos, promotions, analytics, Student ID uploads and settings are **illustrative** and do not authorize those features.
6. **Settings ownership**: tokens in CSS, generator config in `components.json`, runtime deployment secrets in Supabase/Vercel (never public UI), typed nonsecret product UI preferences in `lib/ui-config.ts`. Future editable admin settings require an explicit database schema, access policy, audit/validation and separate approval; do not add speculative settings controls.
7. **Visual gate**: PRs that change UI must include before/after screenshots from real Preview at desktop 1440px and mobile 375px, recorded deviations, manual acceptance status, and CI/CodeQL. Never label Visual Accepted solely from build success.

## Approved screen inventory
Public: homepage, offers list, offer detail.
Admin: dashboard, offers management, offer editor, submission moderation, student verification, category management.
Implement screens only with existing fields/workflows. Status badges must reflect actual database status. Keep admin-specific data private.

## Migration strategy
Foundation and configuration first, then migrate existing high-reuse components and one screen at a time. Avoid a separate UI library or wholesale rewrite. No feature changes hidden in visual-only PRs.
