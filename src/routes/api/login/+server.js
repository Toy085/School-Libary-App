import { db } from '$lib/db/client.js';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import '$lib/db/init.js';

export async function POST({ request }) {
    try {
        const body = await request.json();
        const email = body?.email?.trim();
        const password = body?.password?.trim();

        if (!email || !password) {
            return json({ error: 'Email and password are required.' }, { status: 400 });
        }

        const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
        if (!user) return json({ error: 'Invalid login.' }, { status: 400 });

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return json({ error: 'Invalid login.' }, { status: 400 });

        return json({
            id: user.id,
            name: user.name,
            email: user.email,
            verified: !!user.verified,
            admin: user.admin
        });
    } catch (err) {
        console.error('Login error:', err);
        return json({ error: err.message || 'Server error' }, { status: 500 });
    }
}