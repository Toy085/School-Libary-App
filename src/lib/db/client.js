// src/lib/db/client.js
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'library.db');
export const db = new Database(dbPath);
