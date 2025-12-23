import Database from 'better-sqlite3';
import { building } from '$app/environment';
import path from 'path';
import fs from 'fs'; // You need to import fs to handle file system operations

let dbInstance = null;

if (!building) {
    try {
        const dbPath = path.resolve('data', 'library.db'); // Path to your DB file
        
        // Get the directory where the database will be stored
        const dbDir = path.dirname(dbPath);

        // Ensure the directory exists
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true }); // Create the directory if it doesn't exist
        }

        // Initialize database (create if not exists)
        dbInstance = new Database(dbPath);
        
        // Ensure the table exists by creating it if it doesn't
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
    } catch (e) {
        console.error("Could not open database:", e);
    }
}

export const db = dbInstance;
