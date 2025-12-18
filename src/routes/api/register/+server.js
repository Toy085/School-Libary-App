import { db } from '$lib/db/client.js';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

export async function POST({ request }) {
    try {
        const body = await request.json();

        const name = body?.name?.trim();
        const email = body?.email?.trim().toLowerCase();
        const password = body?.password?.trim();

        if (!name || !email || !password) {
            return json(
                { error: 'Name, email, and password are required.' },
                { status: 400 }
            );
        }

        const existing = db
            .prepare('SELECT id FROM users WHERE email = ?')
            .get(email);

        if (existing) {
            return json({ error: 'Email already exists.' }, { status: 400 });
        }

        // First user becomes admin + verified
        const { count } = db
            .prepare('SELECT COUNT(*) AS count FROM users')
            .get();

        const isAdmin = count === 0 ? 1 : 0;
        const isVerified = count === 0 ? 1 : 0;

        const password_hash = await bcrypt.hash(password, 12);

        const stmt = db.prepare(`
            INSERT INTO users (name, email, password_hash, verified, admin)
            VALUES (?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
            name,
            email,
            password_hash,
            isVerified,
            isAdmin
        );

        return json(
            {
                id: info.lastInsertRowid,
                name,
                email,
                verified: !!isVerified,
                admin: !!isAdmin
            },
            { status: 201 }
        );

    } catch (err) {
        console.error('Register error:', err);
        return json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}
