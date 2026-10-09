# Progress

Canonical **execution log**. The task status lives in [TASKS.json](TASKS.json). This file records what happened and what is waiting on the owner. Workers append entries. They never rewrite earlier ones.

## Current state

- **Milestone:** M0 Foundation (see [ROADMAP.md](ROADMAP.md))
- **Next:** `F-03` (worker): Prettier and base ESLint at the root.

## Open questions for the owner

- **Product name** is TBD. F-06/F-10 use the working name "IELTS Prep" as a placeholder. Note that "IELTS" is a third-party trademark (PRODUCT.md § Content integrity and brand).

## Log

Entry format:

```
### YYYY-MM-DD: <task id> <title>
- Result: done | blocked
- Changes: <one line per notable change>
- Verification: <commands run and outcome; anything "not available yet">
- Versions / choices: <e.g. Next.js x.y, Serwist vs manual SW, and why>
- Notes: <assumptions, placeholders, follow-ups noticed but not done>
```

### 2026-10-09: Execution setup (not a task)
- Result: done
- Changes: ADR-0001 drafted (Proposed); ROADMAP, TASKS (M0 Foundation), PROGRESS, AUTONOMOUS_WORKFLOW created; `work-next-task` skill added; settings deny writes to secret env files and destructive git operations.
- Verification: JSON and links validated. No application code. No dependencies installed.
- Notes: Repository has GitHub remote `origin` and one commit (README). Governance is uncommitted until F-01. The machine has Node 22. ADR-0001 requires Node 24.

### 2026-10-09: ADR-0001 accepted (not a task)
- Result: done
- Changes: Owner confirmed PostgreSQL + Prisma (recorded in ADR-0001, not scaffolded). Removed the prediction of which shared package comes first. Foundation milestone renamed to M0. ADR-0001 marked Accepted.
- Verification: JSON and links validated.
- Notes: F-00 remains `todo` until Node 24 LTS is installed (machine has v22.23.3).

### 2026-10-09: F-01 Repository baseline and governance commit
- Result: done
- Changes: Added `.gitignore` (dependencies, `.next/`, `dist/`, `*.tsbuildinfo`, coverage and Playwright output, logs, `.env` / `.env.*` except `.env.example`, OS/editor files), `.gitattributes` (`* text=auto eol=lf`), `.editorconfig` (UTF-8, LF, 2 spaces, final newline), `.nvmrc` (`24`). Committed the governance (CLAUDE.md, .claude/, docs/).
- Verification: `node --version` → v24.21.0 (via nvm). `git check-ignore -v .env` matches; `.env.example` not ignored; `.env.local`, `apps/web/.env.production`, `node_modules/`, `apps/web/.next/` ignored; no governance file ignored. No CRLF in tracked text. `git status --porcelain` empty and `git ls-files CLAUDE.md .claude docs | wc -l` checked after the commit. Lint/typecheck/test gates: not available yet.
- Versions / choices: `.nvmrc` pins the major (`24`), matching ADR-0001's "Node.js 24 LTS".
- Notes: Node 24 is installed via nvm (default alias `24`), but non-interactive shells that do not source nvm still resolve `/usr/bin/node` v22.23.3. Workers activate nvm per command. Entries for framework-specific generated files (e.g. `next-env.d.ts`) are left to the app scaffold tasks.

### 2026-10-09: F-02 pnpm workspace root and TypeScript base config
- Result: done
- Changes: Root `package.json` (private, `packageManager: pnpm@12.10.1`, `engines.node: ^24`, no dependencies). `pnpm-workspace.yaml` with `apps/*` and `packages/*`. `tsconfig.base.json` with only the four ADR-0001 §2 options. `pnpm-lock.yaml` generated.
- Verification: `node --version` → v24.21.0; `pnpm --version` → 12.10.1; `pnpm install --frozen-lockfile` succeeds (after removing `node_modules`). The four strict options are present in `tsconfig.base.json` and it parses as JSON. Lint/typecheck/test gates: not available yet.
- Versions / choices: pnpm 12.10.1 (npm `latest` tag on 2026-10-09). `corepack enable` was run, which adds pnpm shims to the nvm-managed Node 24 bin directory (task-mandated activation; no system Node change). pnpm 12 records itself under `packageManagerDependencies` in the first YAML document of the lockfile; that is pnpm's own format.
- Notes: The base tsconfig deliberately holds only the shared strictness options. Module, target, and JSX settings differ between Next.js and NestJS, so each app sets them. CLAUDE.md and QUALITY_GATES.md still say "no package.json"; F-11 owns that sync.
