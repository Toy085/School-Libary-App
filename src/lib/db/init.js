import { db } from './client.js';

// Create users table
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    library_card_number TEXT UNIQUE
  )
`).run();

// Create books table
db.prepare(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    ISBN INTERGER UNIQUE NOT NULL,
    user_id INTEGER,
    borrowed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`).run();
