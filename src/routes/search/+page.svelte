<script lang="ts">
	import { onMount } from 'svelte';
	import BookSearchCard from '$lib/BookSearchCard.svelte';
	import BackButton from '$lib/backButton.svelte';

	let query = '';
	let books: any[] = [];
	let filteredBooks: any[] = [];

	onMount(() => {
		loadBooks();
	});
	async function loadBooks() {
		const res = await fetch('/api/books');
		if (res.ok) {
			books = await res.json();

			books = books.map((book: any) => ({
				...book,
				imageUrl: getImageUrl(book.ISBN),
			}));
			searchBooks('');
		} else {
			alert('Failed to load books');
		}
	}

	function getImageUrl(isbn: number | string | undefined): string {
		if (isbn) {
			return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
		}
		return 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
	}

	async function searchBooks(q: string = query) {
		const searchTerm = q.toLowerCase().trim();

		if (searchTerm === '') {
			filteredBooks = books;
		} else {
			filteredBooks = books.filter(
				(book) =>
					book.title.toLowerCase().includes(searchTerm) ||
					book.author?.toLowerCase().includes(searchTerm),
			);
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

<div class="results">
	{#if filteredBooks.length > 0}
		{#each filteredBooks as book}
			<BookSearchCard {book} />
		{/each}
	{:else}
		<p class="text-center mt-4">No books found.</p>
	{/if}
</div>

<BackButton />

<style>
	.SearchTitleText {
		font-weight: bold;
		text-align: center;
	}
	.alert {
		margin: 10px auto;
		width: 40rem;
	}
	.search {
		margin: 0 auto;
		width: 50vw;
	}
	.results {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: 5px;
		overflow-y: auto;
		max-height: 500px;
		padding: 10px;
	}
</style>
