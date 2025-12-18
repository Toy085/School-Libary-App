import { db } from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

export async function PUT({ request, locals }) {
    const userId = locals.user?.id;

    if (!userId) {
        return json({ message: 'Authentication required' }, { status: 401 });
    }

    try {
        // 2. Parse the request body to get the data to update
        const body = await request.json();
        const { library_card_number } = body;

        if (library_card_number === undefined) {
            return json({ message: 'Missing required field: library_card_number' }, { status: 400 });
        }

        // 3. Perform the database UPDATE operation
        const updateStmt = db.prepare(
            'UPDATE users SET library_card_number = ? WHERE id = ?'
        );
        const result = updateStmt.run(library_card_number, userId);

        // Optional: Check if the update actually affected any rows
        if (result.changes === 0) {
             // This can happen if the userId exists but the data sent was identical, 
             // or if the user somehow ceased to exist between the hook and the endpoint call.
             console.warn(`Update attempt for user ID ${userId} resulted in 0 changes.`);
             // We'll proceed to fetch the existing data to send back.
        }

        // 4. Fetch the updated user data
        // We fetch the data again to ensure the client store gets the latest, correct info.
        const updatedUser = db.prepare(
            'SELECT id, name, email, library_card_number, admin FROM users WHERE id = ?'
        ).get(userId);

        if (!updatedUser) {
            // Should not happen if the user was authenticated, but good practice
             return json({ message: 'Updated user data not found.' }, { status: 404 });
        }

        // 5. Return the updated user data
        return json(updatedUser);
        
    } catch (error) {
        console.error('User profile update error:', error);
        return json({ message: 'Internal Server Error' }, { status: 500 });
    }
}