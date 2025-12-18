import { db } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import '$lib/db/init.js';
import { PUBLIC_SESSION_COOKIE_NAME } from '$env/static/public';
import { randomUUID } from 'crypto'; 

export async function POST({ request, cookies }) { 
    if (!db) {
        return json({ error: 'Database not available' }, { status: 500 });
    }
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
        
        const sessionId = randomUUID();

        db.prepare('INSERT INTO sessions (session_id, user_id) VALUES (?, ?)')
            .run(sessionId, user.id);

        cookies.set(PUBLIC_SESSION_COOKIE_NAME, sessionId, {
            path: '/',
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7 // Session lasts 1 week
        });
        return json({
            id: user.id,
            name: user.name,
            email: user.email,
            verified: !!user.verified,
            admin: user.admin
        });
        
    } catch (err) {
        console.error('Login error:', err);
        return json({ error: 'Internal Server Error during login.' }, { status: 500 });
    }
}