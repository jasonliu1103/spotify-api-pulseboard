# Pulseboard

Portfolio starter for a full-stack Spotify analytics dashboard with scheduled data syncs, SQL-backed historical insights, and AI playlist generation.

## Status

This repository currently ships the first public-facing foundation:

- A `Next.js + TypeScript` app scaffold
- A polished landing page that frames the product direction
- Planning docs for architecture, roadmap, and database design
- An `.env.example` for Spotify, Postgres, and AI integrations

The Spotify OAuth flow, ingestion jobs, database layer, and analytics queries are the next implementation milestone.

## Product Direction

Pulseboard is meant to become a music intelligence app that:

- Connects to Spotify with OAuth
- Periodically syncs user and playlist data into Postgres
- Visualizes listening trends over time
- Generates playlists from a natural-language prompt plus actual user taste data

This scope is strong for a portfolio because it combines product engineering, database design, background jobs, analytics, and applied AI in one coherent project.

## Planned Stack

- `Next.js` and `TypeScript` for the app
- `Postgres` and `Prisma` for relational storage and historical snapshots
- Spotify Web API for user, library, and playlist data
- A background job/cron layer for recurring syncs
- An LLM integration for prompt-driven playlist generation

## Current Structure

```text
src/
  app/         Next.js routes and layout
  components/  Presentational UI
  jobs/        Background sync entry points
  lib/         Shared DB, Spotify, AI, and utility code
  server/      Server-side business logic
  types/       Shared TypeScript types
prisma/
  schema.prisma
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

To override the default host or port on either Windows or macOS, set `HOST` and
`PORT` in your shell before running `npm run dev`.

`npm install` also runs `prisma generate` automatically so the Prisma client is
ready after a fresh clone on either machine.

## Local Postgres

This repo is configured for a local Postgres database named `pulseboard`.

If you are using Homebrew PostgreSQL locally, the connection string shape is:

```bash
DATABASE_URL=postgresql://your_user@localhost:5432/pulseboard?schema=public
```

In this workspace, a local `.env` file has already been created for the current machine.

## Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run lint` runs ESLint
- `npm run typecheck` runs the TypeScript compiler without emitting files
- `npm run db:format` formats the Prisma schema
- `npm run db:generate` generates the Prisma client
- `npm run db:push` pushes the Prisma schema to a Postgres database
- `npm run db:studio` opens Prisma Studio

## Docs

- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Schema Draft](docs/schema.md)

## Resume Framing

When the MVP is complete, this project should support bullets like:

- Built a full-stack Spotify analytics platform with scheduled ingestion jobs, a Postgres data model, and an AI-assisted playlist generator
- Designed a relational schema and snapshot pipeline to analyze music preferences, playlist behavior, and listening trends over time
- Developed a responsive dashboard that turned third-party API data into actionable user-facing insights
