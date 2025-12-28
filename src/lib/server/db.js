import Database from 'better-sqlite3';
import { building } from '$app/environment';
import path from 'path';
import fs from 'fs';

let dbInstance = null;

if (!building) {
    try {
        let dbPath;

        // 1. Determine the correct writable directory
        if (process.versions.electron) {
            // We are running inside Electron
            // We use the 'userData' folder which is always writable
            const { app } = require('electron'); 
            dbPath = path.join(app.getPath('userData'), 'library.db');
        } else {
            // we are in development mode (npm run dev)
            dbPath = path.resolve('data', 'library.db');
        }

        const dbDir = path.dirname(dbPath);

        // 2. Ensure the directory exists
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // 3. Initialize database
        dbInstance = new Database(dbPath);
        
        // 4. Setup Tables
        dbInstance.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                pin_hash TEXT,
                verified INTEGER DEFAULT 0,
                admin INTEGER DEFAULT 0,
                library_card_number TEXT UNIQUE
            );
        `);

        console.log("Database initialized at:", dbPath);
    } catch (e) {
        console.error("Could not open database:", e);
    }
}

export const db = dbInstance;