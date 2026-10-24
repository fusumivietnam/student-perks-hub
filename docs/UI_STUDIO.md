# Concept F — local UI Studio

**Status:** Draft calibration workbench. It is not the production interface and is not visually accepted.

Run the existing app locally with `pnpm dev`, then open **http://localhost:3000/ui-studio**.

- The route is intentionally guarded by `process.env.NODE_ENV === "development"`. It returns the application's 404 in Vercel Preview and Production, including `next start` builds.
- Homepage and Dashboard prototypes render in the actual Next.js/Tailwind environment, using shared `Button`, `Input`, `Card`, `Badge` primitives; they contain explicitly marked design data and disabled controls, not live Supabase queries.
- Check desktop **1440px** and mobile **375px**, keyboard navigation, no overflow, type and spacing.
- Use Playwright screenshots for evidence. Do not establish screenshot baselines or claim approval until the owner has approved both calibrations.
- Do not add speculative analytics or settings, route protections, external images, or CMS workflow based on mockup visuals.
- Once approved, map tokens to `app/globals.css` and migrate real routes in coherent families, using existing CI and production release gates.
- Figma master: https://www.figma.com/design/Q9VZWmuVLmv0ZyhjkS1mnN
- Design contract: [CONCEPT_F_DESIGN_CONTRACT.md](CONCEPT_F_DESIGN_CONTRACT.md)

**Storybook decision:** deferred to avoid introducing a parallel component pipeline, extra dependencies and lockfile churn before calibrating the two key screens. This Studio is the lightest zero-dependency step; revisit Storybook once component variants and approved baselines justify it.
