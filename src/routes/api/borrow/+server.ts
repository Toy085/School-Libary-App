import { json } from '@sveltejs/kit';
import { db } from '$lib/db/client.js';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { title, author, ISBN, userId } = body;

		if (!userId) {
			return json({ error: 'Missing user ID' }, { status: 400 });
		}

		db.prepare(`
			INSERT OR IGNORE INTO books (title, author, ISBN, borrowed_at, user_id)
			VALUES (?, ?, ?, datetime('now'), ?)
		`).run(title, author, ISBN, userId);

		return json({ success: true });
	} catch (err: any) {
		console.error('Borrow API error:', err);
		return json({ error: err.message || 'Unknown error' }, { status: 500 });
	}
}
