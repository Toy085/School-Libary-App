import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Point to your database file
const dbPath = path.join(__dirname, 'library.db');

export const db = new Database(dbPath);
