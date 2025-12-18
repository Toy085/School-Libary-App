import { db } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function GET() {
	const users = db.prepare(`
		SELECT id, name, email, verified, admin, library_card_number
		FROM users
	`).all();

	const borrowedBooks = db.prepare(`
		SELECT id, title, author, user_id
		FROM books
		WHERE returned_at IS NULL
	`).all();

	// attach borrowed books to each user
	const result = users.map(user => ({
		...user,
		borrowedBooks: borrowedBooks.filter(
			book => book.user_id === user.id
		)
	}));

	return json(result);
}

export async function POST({ request }) {
	const { name, email } = await request.json();

	let user = db.prepare(
		'SELECT * FROM users WHERE email = ?'
	).get(email);

	if (!user) {
		const stmt = db.prepare(
			'INSERT INTO users (name, email) VALUES (?, ?)'
		);
		const info = stmt.run(name, email);
		user = { id: info.lastInsertRowid, name, email };
	}

	return json(user);
}
