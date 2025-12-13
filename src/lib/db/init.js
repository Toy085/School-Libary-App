import { db } from './client.js';

// Create users table
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    verified INTEGER DEFAULT 0,
    admin INTEGER DEFAULT 0,
    library_card_number TEXT UNIQUE
  )
`).run();

// Create books table
db.prepare(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    ISBN INTEGER UNIQUE NOT NULL,
    user_id INTEGER,
    borrowed_at TEXT,
    returned_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();
