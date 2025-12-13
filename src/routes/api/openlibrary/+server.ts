import { json } from '@sveltejs/kit';

export async function GET({ url }) {
    // 1. Get the query ('q') from the URL parameters
    const q = url.searchParams.get('q');

    if (!q) {
        return json({ docs: [] });
    }

    try {
        // 2. Call Open Library Search API
        // We strictly define the 'fields' to ensure 'isbn' is included and to keep the response small.
        const openLibUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=title,author_name,publisher,first_publish_year,cover_i,isbn`;
        
        const res = await fetch(openLibUrl);

        if (!res.ok) {
            throw new Error('Open Library API error');
        }

        const data = await res.json();

        // 3. Return the data (which now includes the 'isbn' array for every book)
        return json(data);

    } catch (err) {
        console.error(err);
        return json({ error: 'Failed to fetch books' }, { status: 500 });
    }
}