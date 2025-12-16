import { db } from '$lib/db/client'; 
import { PUBLIC_SESSION_COOKIE_NAME } from '$env/static/public';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const sessionId = event.cookies.get(PUBLIC_SESSION_COOKIE_NAME);

    if (sessionId) {
        const session = db.prepare('SELECT user_id FROM sessions WHERE session_id = ?').get(sessionId);

        if (session) {
            const user = db.prepare(
                'SELECT id, name, email, admin, library_card_number FROM users WHERE id = ?'
            ).get(session.user_id);

            if (user) {
                event.locals.user = user;
            }
        }
    }
    const response = await resolve(event);
    return response;
}