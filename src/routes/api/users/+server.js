import { db } from '$lib/db/client.js';
import { auth } from '$lib/firebaseAdmin.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { idToken, name, email } = await request.json();

  // Verify Firebase ID token
  const decodedToken = await auth.verifyIdToken(idToken);
  const firebaseUid = decodedToken.uid;

  // Check if user exists
  let user = db.prepare('SELECT * FROM users WHERE firebase_uid = ?').get(firebaseUid);

  if (!user) {
    // Insert new user
    const stmt = db.prepare('INSERT INTO users (name, email, firebase_uid) VALUES (?, ?, ?)');
    const info = stmt.run(name, email, firebaseUid);
    user = { id: info.lastInsertRowid, name, email, firebase_uid: firebaseUid };
  }

  return json(user);
}
