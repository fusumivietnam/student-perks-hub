# Understand Anything in Codespaces

Understand Anything is installed as a development-only Codex skill when a Codespace is created.

## First analysis

Open a new terminal after the Codespace finishes creating, then run:

```text
$understand
```

The first analysis scans the codebase and writes its reusable knowledge graph under `.ua/`.
Only local scratch artifacts are ignored by Git.

## Useful commands

```text
$understand-dashboard
$understand-diff
$understand-explain app
$understand-domain
$understand-onboard
```

For very large changes, rerun `$understand`; subsequent runs are incremental by default.

## Codespaces behavior

- Node and pnpm versions follow the repository's pinned configuration.
- Docker runs inside the development container for local Supabase.
- Supabase and Next.js are started on Codespace resume when possible.
- Service startup is intentionally non-blocking so a temporary Docker/Supabase problem does not put the Codespace into recovery mode.
- Understand Anything installation is pinned to an upstream commit and is also non-blocking.
- Set `SKIP_UNDERSTAND_ANYTHING=1` before rerunning `.devcontainer/post-create.sh` to skip installation.

If automatic service startup fails, run:

```bash
pnpm local:start
pnpm dev
```

Next.js is forwarded on port 3000; Supabase Studio is forwarded on port 54323.
