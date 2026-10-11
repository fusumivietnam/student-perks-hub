# Context retrieval for coding agents

Student Perks Hub uses two complementary development-only context tools in Codespaces:

- **CocoIndex Code** for low-token semantic code retrieval.
- **Understand Anything** for broad architecture, domain maps, onboarding, and reusable knowledge graphs.

Neither tool is part of the application runtime, CI gate, protected Release workflow, Supabase, or Vercel Production.

## CocoIndex Code

The devcontainer provides Python 3.12 and `.devcontainer/post-create.sh` installs a pinned `cocoindex-code[full]` release into an isolated user venv. The `full` extra provides local embeddings, so no embedding API key is required for the default Codespaces path.

The installation is intentionally non-blocking. If the package registry, model source, or upstream package is temporarily unavailable, Codespace creation still completes and normal repository search remains the fallback.

To skip installation when rerunning the post-create script:

```bash
SKIP_COCOINDEX_CODE=1 bash .devcontainer/post-create.sh
```

Project-local CocoIndex settings and index data live under `.cocoindex_code/` and are ignored by Git.

## First search

From the repository root:

```bash
ccc search production release migration gate
```

The agent owns initialization. If the project has not been initialized yet:

```bash
ccc init
ccc index
ccc search production release migration gate
```

For an index that may be stale:

```bash
ccc search --refresh student verification authorization
```

Useful filters:

```bash
ccc search --lang typescript authentication flow
ccc search --path '.github/workflows/*' production release provenance
ccc search --offset 5 --limit 5 offer freshness pipeline
```

## Retrieval policy

Use the smallest context source that can answer the question reliably:

1. **Known identifier, exact error, filename, or literal** → deterministic repository search/grep.
2. **Unknown implementation location or conceptual behavior** → CocoIndex semantic search.
3. **Broad architecture, domains, onboarding, dependency understanding** → Understand Anything.
4. **Before every edit** → fetch/read the exact current file and surrounding lines; never patch directly from a semantic-search snippet.
5. **After significant structural edits** → refresh with `ccc index` or a `ccc search --refresh ...` query.

This keeps semantic retrieval as a discovery layer while Git/current working tree remains the source of truth.

## Why it is not in CI

CocoIndex exists to reduce agent context and repository discovery cost. Running embeddings/indexing in GitHub Actions would add Action minutes and cache complexity without improving application correctness. CI continues to validate source code with the existing typecheck, lint, build, database, E2E, security, and release gates.

## Relationship to Understand Anything

Do not use both tools mechanically for every task.

Use CocoIndex when the question is similar to:

- "Where is the code that rejects pending Production migrations?"
- "Find the student verification authorization path."
- "Which code handles offer freshness?"

Use Understand Anything when the question is similar to:

- "How do public routes, admin moderation, Supabase, and Release fit together?"
- "Explain the Offers domain to a new contributor."
- "What is the architecture/blast radius of this subsystem?"

See `docs/understand-anything.md` for the knowledge-graph workflow.
