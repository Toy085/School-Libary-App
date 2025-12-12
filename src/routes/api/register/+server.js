import { db } from '$lib/db/client.js';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

export async function POST({ request }) {
    try {
        const body = await request.json();
        console.log('Register body:', body); // debug

        const name = body?.name?.trim();
        const email = body?.email?.trim().toLowerCase();
        const password = body?.password?.trim();

        if (!name || !email || !password) {
            return json({ error: 'Name, email, and password are required.' }, { status: 400 });
        }

        const existing = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
        if (existing) return json({ error: 'Email already exists.' }, { status: 400 });

        const password_hash = await bcrypt.hash(password, 12);

        const stmt = db.prepare(`
            INSERT INTO users (name, email, password_hash, verified)
            VALUES (?, ?, ?, 0)
        `);
        const info = stmt.run(name, email, password_hash);

        return json({
            id: info.lastInsertRowid,
            name,
            email,
            verified: false
        });

    } catch (err) {
        console.error('Register error:', err);
        return json({ error: err.message || 'Server error' }, { status: 500 });
    }
}
