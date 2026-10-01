# Student Perks Hub

Student-first directory for discovering verified education discounts, credits, trials, and free tools.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui primitives
- Supabase PostgreSQL + Auth
- Supabase CLI local stack
- @supabase/ssr

## Local-first development

Requirements:

- Node.js 20+
- pnpm via Corepack
- Docker-compatible container runtime

Install dependencies and start the local stack:

```bash
corepack enable
pnpm install
pnpm local:start
pnpm dev
```

`pnpm local:start` starts Supabase through Docker and generates the local
`.env` / `.env.local` files from the running stack. Do not commit those files.

Useful commands:

```bash
pnpm local:status
pnpm local:stop
pnpm db:reset
pnpm db:types
pnpm db:schema:sync
```

The database source of truth lives in `supabase/schemas/`. Local seed data lives
in `supabase/seed.sql`. Edit the declarative schema first; generate migrations
from it rather than making untracked schema changes in Studio.

## GitHub Codespaces

Create a Codespace from the repository. The checked-in devcontainer installs the
Node environment, pnpm dependencies, and Docker access required by the Supabase
CLI.

Inside the Codespace run:

```bash
pnpm local:start
pnpm dev
```

Only the Next.js port (3000) is forwarded by default.

The local Supabase API is deliberately **not** exposed as a public Codespaces
port. Browser requests use the application's same-origin `/supabase/*` proxy,
while Server Components and the auth proxy connect directly to
`127.0.0.1:54321` inside the Codespace.

This keeps the development-only Supabase stack private while still supporting
browser-side Supabase clients.

If an existing Codespace predates changes to `.devcontainer/devcontainer.json`,
rebuild its container before continuing.

## Database workflow

For normal development:

1. Edit SQL under `supabase/schemas/`.
2. Generate a reviewed migration:

   ```bash
   pnpm db:schema:sync -f <change-name>
   ```

3. Review the generated migration.
4. Apply/reset locally as appropriate.
5. Regenerate database types:

   ```bash
   pnpm db:types
   ```

Remote Supabase linking and production deployment are intentionally separate from
the local workflow.

See `AGENTS.md` for coding-agent rules and `docs/ROADMAP.md` for implementation order.
