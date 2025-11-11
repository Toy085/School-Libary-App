<script lang="ts">
	import { onMount } from 'svelte';
	import BookSearchCard from '$lib/BookSearchCard.svelte';

	let query = '';
	let books: any[] = [];
	let loading = false;
	let error = '';

	async function searchBooks(q: string) {
		loading = true;
		error = '';
		books = [];

		try {
			const res = await fetch(
				`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`,
			);
			if (!res.ok) throw new Error('Failed to fetch books');

			const data = await res.json();
			books = data.docs.map((doc: any) => ({
				name: doc.title,
				author: doc.author_name?.[0] || 'Unknown',
				publisher: doc.publisher?.[0] || 'Unknown',
				year: doc.first_publish_year || 'N/A',
				imageUrl: doc.cover_i
					? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
					: 'https://via.placeholder.com/128x190?text=No+Cover',
			}));
		} catch (err: any) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		searchBooks(query);
	}
</script>

<h1 class="SearchTitleText">Search</h1>

<div class="alert alert-danger alert-dismissible fade show" role="alert">
	<strong>NOT</strong>
	all books are available due to each book being added as they are borrowed.
	<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" />
</div>

<form class="d-flex search" role="search" on:submit|preventDefault={handleSubmit}>
	<input
		bind:value={query}
		name="q"
		class="form-control me-2"
		type="search"
		placeholder="Search"
		aria-label="Search"
	/>
	<button class="btn btn-outline-success" type="submit">Search</button>
</form>

{#if loading}
	<p style="text-align:center;">Loading...</p>
{:else if error}
	<p style="text-align:center;color:red;">{error}</p>
{:else if books.length === 0 && query}
	<p style="text-align:center;">No results for "{query}"</p>
{:else}
	<div class="results">
		{#each books as book}
			<BookSearchCard
				name={book.name}
				author={book.author}
				publisher={book.publisher}
				year={book.year}
				imageUrl={book.imageUrl}
			/>
		{/each}
	</div>
{/if}

<a href="/" class="BackButton">
	<button type="button" class="btn btn-primary"><i class="bi bi-arrow-return-left" /></button>
</a>

<style>
	.SearchTitleText {
		font-weight: bold;
		text-align: center;
	}
	.alert {
		margin: 0 auto;
		width: 75vw;
	}
	.search {
		margin: 0 auto;
		width: 50vw;
	}
	.results {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	.BackButton {
		margin: 0 auto;
		display: block;
		text-align: center;
	}
</style>
