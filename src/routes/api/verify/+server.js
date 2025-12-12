// src/routes/api/verify-user/+server.js
import { db } from '$lib/db/client.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { userId } = await request.json();

  db.prepare(`UPDATE users SET verified = 1 WHERE id = ?`).run(userId);

  return json({ success: true });
}
