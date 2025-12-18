import { db } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, locals }) {
	const { userId } = await request.json();

	// Only allow admins to delete users
	//if (!locals.user || locals.user.admin !== 1) {
	//	return json({ error: 'Unauthorized' }, { status: 403 });
	//}

	// Prevent deleting yourself 
	//if (locals.user.id === userId) {
	//	return json({ error: 'You cannot delete yourself' }, { status: 400 });
	//}

	// First: unassign books borrowed by this user
	db.prepare(`
		UPDATE books
		SET user_id = NULL, returned_at = datetime('now')
		WHERE user_id = ?
	`).run(userId);

	// Then: delete the user
	db.prepare(`
		DELETE FROM users
		WHERE id = ?
	`).run(userId);

	return json({ success: true });
}
