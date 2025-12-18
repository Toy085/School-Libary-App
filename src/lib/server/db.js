import Database from 'better-sqlite3';
import { building } from '$app/environment';

let dbInstance = null;

if (!building) {
    try {
        dbInstance = new Database('library.db');
    } catch (e) {
        console.error("Could not open database:", e);
    }
}

export const db = dbInstance;