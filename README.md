# IELTS Prep

A mobile-first IELTS preparation PWA for candidates in Uzbekistan, with an Uzbek, Russian, and English interface. The name "IELTS Prep" is a working title.

The repository is a pnpm monorepo: `apps/web` (Next.js) and `apps/api` (NestJS).

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm via Corepack: `corepack enable`

## Getting started

```sh
pnpm install --frozen-lockfile
pnpm check   # format check, lint, typecheck, unit tests
pnpm build
```

All commands: [docs/engineering/QUALITY_GATES.md](docs/engineering/QUALITY_GATES.md).

## Documentation

- [CLAUDE.md](CLAUDE.md): project guide and the map of where each topic lives
- [docs/](docs/): product, design, architecture, engineering, and execution docs
