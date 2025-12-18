import { db } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const { bookId } = await request.json();

    db.prepare(`
        DELETE FROM books
        WHERE id = ?
    `).run(bookId);

    return json({ success: true });
}
