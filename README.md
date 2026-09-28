# Gator 🐊

An RSS feed aggregator CLI built with **TypeScript** and **PostgreSQL**.

Built as part of the Boot.dev "Build a Blog Aggregator" course, part of the Boot.dev Stage learning program in collaboration with **Foothill Technology Solutions**.

## What it does

- Add RSS feeds from around the web
- Follow / unfollow feeds added by other users
- Continuously fetch new posts in the background and store them in PostgreSQL
- Browse the latest posts from your followed feeds, right in the terminal

## Prerequisites

To run `gator`, you'll need:

- **Node.js** `22.15.0` — managed via [nvm](https://github.com/nvm-sh/nvm) (run `nvm use` in the project root)
- **PostgreSQL** (v16+) installed and running locally

## Installation

```bash
git clone https://github.com/shahdraed246-blip/gator.git
cd gator
nvm use
npm install
```

## Configuration

`gator` reads its settings from a config file at `~/.gatorconfig.json` in your home directory. Create it manually:

```json
{
  "db_url": "postgres://postgres:postgres@localhost:5432/gator?sslmode=disable"
}
```

The `current_user_name` field is managed automatically by the app once you register or log in — you don't need to set it yourself.

Run the database migrations before first use:

```bash
npx drizzle-kit migrate
```

## Usage

Run any command with:

```bash
npm run start <command> [args...]
```

### Available commands

| Command | Description |
|---|---|
| `register <name>` | Create a new user and log in as them |
| `login <name>` | Switch the current user |
| `users` | List all users, marking the current one |
| `reset` | Wipe all data (useful for testing) |
| `addfeed <name> <url>` | Add a new RSS feed and automatically follow it |
| `feeds` | List all feeds in the system and who added them |
| `follow <url>` | Follow a feed that already exists |
| `unfollow <url>` | Unfollow a feed |
| `following` | List feeds the current user follows |
| `agg <duration>` | Start the long-running aggregator (e.g. `agg 1m`). Fetches feeds on a loop and saves new posts. Stop with `Ctrl+C` |
| `browse [limit]` | Show the latest posts from feeds you follow (default: 2) |

### Example session

```bash
npm run start register alice
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
npm run start agg 1m
# ...in another terminal, while agg is running:
npm run start browse 5
```

## Tech Stack

- **TypeScript**
- **PostgreSQL**
- **Drizzle** — type-safe SQL / migrations
- **fast-xml-parser** — RSS/XML parsing
