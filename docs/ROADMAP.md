# Implementation Roadmap

Work in small vertical slices. Every slice must pass typecheck/lint and receive a Ponytail diff review.

## 00 — Baseline

- Next.js App Router + TypeScript + Tailwind
- Supabase SSR clients and proxy
- shadcn registry configuration
- design tokens and app shell
- source database schema + RLS
- agent guardrails

## 01 — Database connection

- select the intended Supabase project explicitly
- turn supabase/schema.sql into a CLI-generated migration
- apply migration
- run Supabase security/performance advisors
- generate database TypeScript types
- configure repository environment locally/deployment-side without committing secrets

## 02 — Categories

- focused query helper
- render database categories on homepage and /categories
- loading and empty states
- no client fetch when server fetch is sufficient

## 03 — Offer card + seed data

- reusable OfferCard
- reviewed seed offers linking to official sources
- benefit badges
- no scraped/copyright-copied content

## 04 — Homepage offers

- featured
- popular via deterministic database field/rank
- recently published
- responsive grids

## 05 — Offers discovery

- q, category, benefit type, audience, sort, page in URL search params
- server-side query
- pagination
- mobile filter sheet from shadcn

## 06 — Offer detail

- /offers/[slug]
- metadata
- eligibility
- how to claim
- official external link
- related offers
- notFound for invalid slug

## 07 — Authentication

- Supabase Auth
- validated server identity via current Supabase guidance
- login/logout
- OAuth callback if enabled
- no custom token handling

## 08 — Bookmarks

- authenticated-only
- database is source of truth
- own-row RLS
- save/unsave via Server Action
- /saved reads server-side

## 09 — Submit offer

- Server Action
- Zod validation
- public/authenticated submission according to RLS
- clear success/error states
- no direct publishing

## 10 — Admin

Only after an authorization model is explicitly decided and tested.

- server-side admin authorization
- review submissions
- offer/category CRUD
- publish/expire/archive

Do not infer admin permission from client state or user-editable metadata.

## 11 — Production readiness

- metadata/canonical/OG
- sitemap and robots
- accessibility pass
- critical Playwright flows
- performance check
- legal content
- deployment configuration
