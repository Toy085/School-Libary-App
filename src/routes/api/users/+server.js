import { db } from '$lib/db/client.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { name, email } = await request.json();

  // Check if user exists by email (or any identifier you prefer)
  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    // Insert new user
    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    const info = stmt.run(name, email);
    user = { id: info.lastInsertRowid, name, email };
  }

  return json(user);
}
