import { db } from '$lib/db/client.js';
import { json } from '@sveltejs/kit';

export async function GET() {
  const books = db.prepare(`
    SELECT books.*, users.name as user_name
    FROM books
    LEFT JOIN users ON books.user_id = users.id
  `).all();
  return json(books);
}

export async function POST({ request }) {
  const { title, author, user_id } = await request.json();
  const stmt = db.prepare('INSERT INTO books (title, author, user_id) VALUES (?, ?, ?)');
  const info = stmt.run(title, author, user_id || null);
  return json({ id: info.lastInsertRowid, title, author, user_id });
}
