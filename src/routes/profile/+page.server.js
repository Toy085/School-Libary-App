/** @type {import('./$types').PageServerLoad} */
import { redirect } from '@sveltejs/kit';
export async function load({ locals }) {
    console.log('Server Load - Locals:', locals);
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    return {
        user: locals.user,
        form: null
    };
}