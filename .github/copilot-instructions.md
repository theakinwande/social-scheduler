# Social Scheduler - Copilot Instructions

## Project Overview
A Twitter/X post scheduler with Svelte frontend and Node.js backend. Single-user app for scheduling tweets.

## Architecture
- **Frontend:** Svelte 4 + Vite (in `/client`)
- **Backend:** Node.js + Express (in `/server`)
- **Database:** SQLite with better-sqlite3
- **Twitter:** twitter-api-v2 library
- **Scheduling:** node-cron (runs every minute)

### Data Flow
1. User creates post via Svelte UI → POST /api/posts
2. Post stored in SQLite with `scheduled` status
3. Cron job checks for due posts every minute
4. Due posts sent to Twitter API → status updated to `posted` or `failed`

## Development Workflow

### Setup
```bash
npm run setup          # Install all dependencies
cp .env.example .env   # Configure Twitter API keys
```

### Build & Run
```bash
npm run dev            # Start both frontend (5173) and backend (3000)
npm run dev:server     # Backend only with --watch
npm run dev:client     # Frontend only
npm run build          # Production build
npm start              # Run production server
```

### Testing
```bash
# No tests configured yet - add with Vitest for frontend, Jest for backend
```

## Code Conventions
- ES Modules (`type: "module"`)
- Svelte components in PascalCase
- API routes return JSON with `{ error: message }` on failure
- Database queries use prepared statements
- Dates stored as ISO strings in SQLite

## Key Directories
- `/client/src/components` - Svelte UI components
- `/client/src/stores` - Svelte stores for state management
- `/server/routes` - Express API routes
- `/server/services` - Business logic (Twitter, scheduler)
- `/server/db` - Database setup and queries
- `/data` - SQLite database file (gitignored)
