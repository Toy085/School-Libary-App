import { db } from '$lib/server/db';
import { building } from '$app/environment';

if (!building && db) {
  // Create users table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      pin_hash TEXT,
      verified INTEGER DEFAULT 0,
      admin INTEGER DEFAULT 0,
      library_card_number TEXT UNIQUE
    )
  `).run();

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create books table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER,
      ISBN TEXT UNIQUE NOT NULL,
      borrowed_at TEXT,
      returned_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `).run();
}