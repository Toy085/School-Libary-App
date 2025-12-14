import { json } from '@sveltejs/kit';
import { db } from '$lib/db/client.js';

export async function POST({ request }) {
    try {
        const { bookId } = await request.json();

        if (!bookId) {
            return json({ error: 'Missing book ID' }, { status: 400 });
        }

        db.prepare(`
            UPDATE books
            SET user_id = NULL, returned_at = datetime('now')
            WHERE id = ?
        `).run(bookId);

        return json({ success: true, message: `Book ${bookId} successfully returned.` });
    } catch (err) {
        console.error('Return Book API error:', err);
        return json({ error: 'Failed to process book return' }, { status: 500 });
    }
}