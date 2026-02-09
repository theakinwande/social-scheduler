import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');
const dbPath = path.join(dataDir, 'scheduler.db');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// Initialize database immediately
db.pragma('journal_mode = WAL');

// Create posts table
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    media_urls TEXT,
    scheduled_at DATETIME NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'posted', 'failed', 'draft')),
    twitter_post_id TEXT,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index for efficient scheduling queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_posts_scheduled 
  ON posts(scheduled_at, status)
`);

export function initDatabase() {
  console.log('✅ Database initialized');
}

// Post CRUD operations - prepared after table creation
export const postQueries = {
  getAll: db.prepare(`
    SELECT * FROM posts 
    ORDER BY scheduled_at DESC
  `),

  getScheduled: db.prepare(`
    SELECT * FROM posts 
    WHERE status = 'scheduled' AND scheduled_at <= datetime('now')
    ORDER BY scheduled_at ASC
  `),

  getUpcoming: db.prepare(`
    SELECT * FROM posts 
    WHERE status = 'scheduled' AND scheduled_at > datetime('now')
    ORDER BY scheduled_at ASC
  `),

  getById: db.prepare(`
    SELECT * FROM posts WHERE id = ?
  `),

  create: db.prepare(`
    INSERT INTO posts (content, media_urls, scheduled_at, status)
    VALUES (?, ?, ?, ?)
  `),

  update: db.prepare(`
    UPDATE posts 
    SET content = ?, media_urls = ?, scheduled_at = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  updateStatus: db.prepare(`
    UPDATE posts 
    SET status = ?, twitter_post_id = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  delete: db.prepare(`
    DELETE FROM posts WHERE id = ?
  `)
};
