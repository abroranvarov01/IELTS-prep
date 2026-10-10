# IELTS Prep

A mobile-first IELTS preparation PWA for candidates in Uzbekistan, with an Uzbek, Russian, and English interface. The name "IELTS Prep" is a working title.

The repository is a pnpm monorepo: `apps/web` (Next.js) and `apps/api` (NestJS).

## Prerequisites

- Node.js 24 (see `.nvmrc`)
- pnpm via Corepack: `corepack enable`
- Docker Engine with the Compose plugin, for the local database

## Getting started

```sh
pnpm install --frozen-lockfile
pnpm check   # format check, lint, typecheck, unit tests
pnpm build
```

## Local database

The API needs PostgreSQL. `compose.yaml` defines a local one (port 5432 on 127.0.0.1, data in a Docker volume):

```sh
pnpm db:up                                  # start and wait until it is ready
cp apps/api/.env.example apps/api/.env      # once: DATABASE_URL for the local database
pnpm db:down                                # stop; the data is kept
```

All commands: [docs/engineering/QUALITY_GATES.md](docs/engineering/QUALITY_GATES.md).

## Documentation

- [CLAUDE.md](CLAUDE.md): project guide and the map of where each topic lives
- [docs/](docs/): product, design, architecture, engineering, and execution docs
