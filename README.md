# Social Scheduler

A simple X (formerly Twitter) post scheduler. Write posts, attach images, schedule them, and they'll be posted automatically.

![Screenshot](screenshot.png)

## Features

- 📝 **Compose posts** with 280 character limit indicator
- 🖼️ **Attach media** - images, GIFs, or video (up to 4 images or 1 video)
- ⏰ **Schedule posts** with quick presets (1h, 3h, Tomorrow 9am, etc.)
- 📋 **Save drafts** for later
- ✏️ **Edit** scheduled posts before they go live
- 📊 **View history** of posted content
- 🔄 **Auto-posting** via background cron job (every minute)

## Tech Stack

- **Frontend:** Svelte 4 + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite
- **X API:** twitter-api-v2

## Quick Start

### 1. Install

```bash
npm run setup
```

### 2. Configure X API

Get your API credentials from [developer.x.com](https://developer.x.com/en/portal/dashboard):

1. Create a project and app
2. Go to **Keys and tokens**
3. Copy **API Key** and **API Secret** (under Consumer Keys)
4. Generate **Access Token** and **Access Token Secret** (for your account)

Create `.env` file:

```env
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_SECRET=your_access_secret
```

### 3. Run

```bash
npm run dev
```

Open [localhost:5173](http://localhost:5173)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Install all dependencies |
| `npm run dev` | Start dev server (frontend + backend) |
| `npm run dev:server` | Backend only |
| `npm run dev:client` | Frontend only |
| `npm run build` | Production build |
| `npm start` | Run production server |

## Project Structure

```
├── client/                 # Svelte frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── stores/        # Svelte stores
│   │   └── App.svelte
│   └── index.html
├── server/                 # Express backend
│   ├── routes/            # API endpoints
│   ├── services/          # X API, scheduler
│   └── db/                # SQLite setup
├── data/                   # SQLite database (gitignored)
└── .env                    # API credentials (gitignored)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| GET | `/api/x/verify` | Check X connection |

## How It Works

1. Create a post with optional images and schedule time
2. Post is saved to SQLite database with `scheduled` status
3. Cron job runs every minute checking for due posts
4. When scheduled time arrives, post is sent to X API
5. Status updates to `posted` (success) or `failed` (error)

## Notes

- Posts are stored locally in SQLite
- Media stored as base64 (for simplicity - use cloud storage for production)
- Single user only - uses your own X account
- If X API isn't configured, posts are simulated (logged but not sent)

## License

MIT
