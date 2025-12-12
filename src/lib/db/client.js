// src/lib/db/client.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'library.db');

console.log('DB path:', dbPath);

// Export DB instance
export const db = new Database(dbPath);