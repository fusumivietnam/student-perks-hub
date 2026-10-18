# Admin UI contract

This document defines the **implementation contract** for the approved Student Perks Hub admin workspace mockup (six-screen concept approved in the project conversation, 18 October 2026). The mockup is a **visual direction, not evidence that sample counters, reports, uploads, or settings already exist**. GitHub PRs and Actions remain the live execution source of truth; do not copy CI or PR status here.

## Principles

- **Core operations first.** Moderation and offer/content CRUD must be useful before introducing analytics, settings, media uploads or notifications.
- **One task per screen.** Dashboard is an operational entry point, not a long list of inline editor forms. Navigation stays consistent.
- **Preserve security.** Every admin route requires server-side membership validation; mutations keep server-side validation, existing RPC and RLS policies. No client-side-only authorization.
- **Consistent language.** UI copy is Vietnamese; status codes in database/API remain canonical English enums.
- **Responsive and accessible.** Semantic headings, form labels, visible focus, 44px touch targets, keyboard reachable actions and overflow-safe mobile lists.

## Information architecture and delivery order

| Priority | Route | Primary job | State |
| --- | --- | --- | --- |
| P0 | `/admin` | Exact core metrics, pending queue shortcuts | Existing implementation |
| P0 | `/admin/submissions` | Review submitted offers with feedback and linked drafts | Existing implementation, refine UX |
| P0 | `/admin/verifications` | Review student verification requests | Existing implementation, refine UX |
| P0 | `/admin/content` | Existing category and offer editing | Transitional legacy forms; split into list/edit routes next |
| P1 | `/admin/freshness` | Review stale offers | Existing implementation |
| P1 | `/admin/content/offers`, `/new`, `/[id]` | Search/filter offers, create/edit on dedicated pages | Planned, not implemented |
| P1 | `/admin/content/categories` | Manage categories in a focused list | Planned, not implemented |
| P2 | Reports, settings, user management | Only after a supported real use case exists | Out of current scope |

Do not create placeholder routes for planned features.

## Layout & components

- White admin sidebar on desktop, horizontally scrollable navigation at smaller widths; page content remains readable without horizontal viewport overflow.
- Workspace heading and scoped context; primary action at top right when the page has one.
- Overview: compact KPI cards with exact backend counts; no fabricated trends or metrics. Quick actions link to real destinations.
- Queues: status tabs with exact counts, actionable items, visible review notes and timestamps; form submissions preserve server-side stale-state checks.
- Content list: search, status/category filters and real pagination before adding bulk actions.
- Editor: labeled groups for essentials, benefit, publishing status and official URL. Save and destructive actions are visually separate.
- Shared visual language: primary blue, neutral slate backgrounds, rounded-xl/2xl cards, restrained border/shadow, meaningful status colors.
- Status translations: pending → Chờ duyệt; approved → Đã duyệt; rejected → Từ chối; cancelled → Đã hủy; draft → Bản nháp; published → Đã xuất bản; archived → Đã lưu trữ.

## States and quality gates

For every touched screen: explicit loading/empty/error/success behavior; test keyboard focus, mobile viewport, actionable labels, and server authorization. Verify the happy path and one relevant failure case with Playwright when applicable. Include relevant UI tests and documentation in the **same** implementation PR; protect CI Gate, CodeQL and exact-SHA release workflow.

## Scope discipline

The concept shows illustrative analytics, report charts, user management, image uploads and settings. These are **deferred**: implement only when there is a concrete operational requirement and a verified data source. No mock or invented production metrics.

## Approved operational policies (18 October 2026)

- New offers are saved as `draft` regardless of the submitted status. Publishing requires a separate, intentional edit by an authorized administrator.
- Routine removal is **archive**, not permanent deletion. Archiving clears featured status and makes published offers unavailable to public discovery through existing publication filters.
- Permanent delete is not offered in the normal Admin UI. Exceptional irreversible deletion requires a separate reviewed procedure and explicit human authorization.
