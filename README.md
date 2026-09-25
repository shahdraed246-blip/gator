# Gator 🐊

An RSS feed aggregator CLI built with **TypeScript** and **PostgreSQL**.

Built as part of the Boot.dev "Build a Blog Aggregator" course, part of the Boot.dev Stage learning program in collaboration with **Foothill Technology Solutions**.

## What it does

- Add RSS feeds from around the web
- Follow / unfollow feeds added by other users
- Continuously fetch new posts in the background and store them in PostgreSQL
- Browse aggregated posts from the terminal, with a link to the full post

## Tech Stack

- **TypeScript**
- **PostgreSQL**
- **Drizzle** — type-safe SQL / migrations

## Getting Started

### Prerequisites

- Node.js `22.15.0` (managed via [nvm](https://github.com/nvm-sh/nvm) — run `nvm use` in the project root)
- PostgreSQL installed and running locally

### Installation

```bash
git clone https://github.com/USERNAME/gator.git
cd gator
nvm use
npm install
```

### Environment Variables

> TBD once the database config step is done.

```
DB_URL=postgres://...
```

## Usage

> TBD — CLI commands will be documented here as they're built (e.g. `gator addfeed`, `gator follow`, `gator browse`).

## Project Status

🚧 In progress — currently on project setup (Node version + repo initialization).

## Learning Goals

- Integrating a TypeScript app with PostgreSQL
- Writing and running SQL migrations with Drizzle
- Building a long-running service that polls RSS feeds and persists new posts
