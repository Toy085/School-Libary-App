import { db } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        const books = db.prepare(`
            SELECT 
                books.*, 
                users.name as user_name,
                users.email as user_email
            FROM books
            LEFT JOIN users ON books.user_id = users.id
        `).all();
        
        return json(books);
    } catch (err) {
        return json({ error: err.message }, { status: 500 });
    }
}
// POST: Adds a new book to the database
export async function POST({ request }) {
    try {
        const { title, author, ISBN, user_id } = await request.json(); 

        const stmt = db.prepare(`
            INSERT INTO books (title, author, ISBN, user_id, borrowed_at) 
            VALUES (?, ?, ?, ?, datetime('now'))
        `);
        
        const info = stmt.run(title, author, ISBN, user_id || null);
        
        return json({ 
            id: info.lastInsertRowid, 
            title, 
            author, 
            ISBN, 
            user_id 
        });
    } catch (err) {
        console.error('Add Book Error:', err);
        return json({ error: err.message }, { status: 500 });
    }
}