# ADR-0004: Feature Structure and Domain Code in apps/web

- **Status:** Proposed (2026-10-10, task M3-04). Waiting for the owner's acceptance in M3-05.
- **Date:** 2026-10-10
- **Deciders:** Project owner (acceptance), Claude (draft)

## Context

[ARCHITECTURE.md](../ARCHITECTURE.md#open-decisions-tbd) leaves the feature folder structure open "until the first feature". M3 brings the first features to `apps/web`: the guest's goal (exam type and target band), onboarding, and home with its next-action rule ([USER_FLOWS.md](../../product/USER_FLOWS.md#onboarding-and-home-flows-m3), draft; guest state per ADR-0003, proposed).

Today `apps/web/src` has `app/` (routes, the shell, `StatusMessage`, `LanguageSwitcher`), `i18n/`, and `styles/`. Tests sit next to the code they test (`*.test.ts(x)`), and `@/*` resolves to `src/*`.

Forces:
- **INVARIANTS I-3 and I-4:** UI components do not decide rules; domain behavior is testable without rendering. The next-action rule and the goal's values are the first web domain rules, and Reading's scoring and answer checking follow in M4.
- **BOUNDARIES.md:** a boundary must be enforced by tooling, or it erodes. `import/no-restricted-paths` already separates `apps/web` from `apps/api`.
- **ADR-0001 §1:** shared code moves to `packages/*` only when both apps need it. The API does not need web domain code yet.
- **CODE_QUALITY.md:** no abstraction without a current use, no empty folders, no layers for symmetry.

## Decision

### 1. Layout of `apps/web/src`

```
app/           Routes, layouts and the shell (header, language switcher, status pages). Pages stay thin: they read data and compose a feature.
features/      One folder per user-facing feature: its screens' components and its Server Actions.
  onboarding/    the three steps (M3-07)
  home/          the home screen (M3-08)
components/    Presentational UI used by two or more features (the primary button, the quiet link). Nothing feature-specific.
domain/        Pure TypeScript product and IELTS rules: the goal's values and their parsing, the next-action rule, later Reading scoring.
data/          Server-side data access: the goal cookie now (ADR-0003), API clients later. Server-only.
i18n/, styles/ Unchanged.
```

- A folder is created by the first task that puts code in it. No empty folders, no index files that only re-export.
- A component starts inside its feature and moves to `components/` when a second feature needs it (for example the answer option stays in `features/onboarding/` until something else uses it).
- Tests stay next to the code they test. Domain tests need no rendering.
- File names: React components in PascalCase (`AnswerOption.tsx`, as `LanguageSwitcher.tsx`), other modules in kebab-case (`next-action.ts`).

### 2. Import rules, enforced by lint

| Folder | May import | Must not import |
|---|---|---|
| `domain/` | other `domain/` files | React, Next.js, next-intl, Node or browser APIs, and every other `src/` folder |
| `data/` | `domain/`, Next.js server APIs (`next/headers`) | `features/`, `components/`, `app/` |
| `components/` | other `components/`, `i18n/` | `features/`, `data/`, `app/` |
| `features/<f>/` | its own folder, `domain/`, `data/`, `components/`, `i18n/` | another feature, `app/` |
| `app/` | everything above | |

- Enforcement: zones in the existing `import/no-restricted-paths` rule (`eslint.config.mjs`) for the folder rules, and `no-restricted-imports` for the package bans in `domain/` (`react`, `react-dom`, `next`, `next/*`, `next-intl`, `node:*`). Each rule is verified once with a forbidden import, by the task that creates the folder (M3-06 for `domain/` and `data/`).
- `proxy.ts` sits outside these folders. It may import `domain/` (to parse the goal cookie, ADR-0003) and nothing from `features/` or `components/`.

### 3. When domain code moves to `packages/`

When `apps/api` needs the same rule (for example, scoring that must run on the server once results are stored, INVARIANTS I-2), that part of `domain/` moves to a `packages/` package, and lint gains the zone "packages never import apps" (BOUNDARIES.md). Until then, web domain code stays in `apps/web`.

### 4. Not decided here
The structure inside `apps/api` (it has `database/` and `errors/` today; it is decided with its first feature module), client-side state management (none is needed: state stays local, and the server reads the goal), and data fetching from the API (no web page calls the API yet).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. Feature folders plus shared `domain/`, `data/`, `components/` (chosen)** | A feature is one folder; rules sit in one framework-free place that can later move to `packages/` as is; every boundary can be expressed as a lint zone | Five top-level folders; deciding "feature or shared?" needs the second-consumer rule |
| B. Layer folders only (`components/`, `actions/`, `domain/`, ...), with feature names as subfolders in each | Familiar; every layer in one place | One feature is spread over many folders; nothing stops one feature's components from reaching into another's |
| C. Colocate everything with routes (`app/[locale]/(valid-locale)/start/_components/...`) | Next.js's suggested colocation; few folders | Onboarding spans three routes, so its shared parts have no natural home; deep paths under route groups; mixes routing and product code; domain rules end up near JSX |
| D. A `packages/domain` package now | Ready for the API to share | ADR-0001 §1: no package without a second consumer; adds build and config work for code only the web uses |

## Why this decision

- **Correctness:** domain rules live where React and Next.js cannot reach them, enforced by lint (I-3, I-4). The next-action rule and Reading's scoring later get one canonical, tested home (I-2).
- **Simplicity:** five plain folders, each with a one-line purpose; no barrels, no empty scaffolding; moving to `packages/` is a move, not a rewrite.
- **Consistency:** the same mechanism (`import/no-restricted-paths`) that already separates the two apps enforces the folders.

## Consequences

- **Positive:** M3-06 to M3-09 know where every file goes, and lint fails on a rule placed in the wrong folder.
- **Costs accepted:** a few more lint zones to maintain. Moving a component from a feature to `components/` is a small, explicit change when its second consumer appears.
- **Harder to change later:** the top-level folder names, once many features use them.

## Follow-up / migration notes

- **Implementation:** M3-06 creates `domain/` and `data/` with their lint rules (each verified once with a forbidden import), M3-07 `features/onboarding/` and `components/`, M3-08 `features/home/`. `StatusMessage` and `LanguageSwitcher` stay in `app/` as shell code. Moving them is not part of M3.
- **Docs on acceptance:** BOUNDARIES.md (module rules and their enforcement, updated in M3-06), ARCHITECTURE.md (move "Feature folder structure" for `apps/web` to Confirmed; `apps/api` stays open), QUALITY_GATES.md (the new lint zones).
