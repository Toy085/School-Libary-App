import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve('Desktop App/lib/db/database.db');
export const db = new Database(dbPath);
