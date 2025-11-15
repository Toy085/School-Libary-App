<script lang="ts">
	import { currentUser } from '$lib/stores/user';
	import LogOutButton from '$lib/logout.svelte';
	import BookBorrowCard from '$lib/BookBorrowCard.svelte';

	$: isLoggedIn = !!$currentUser;

	let query = '';
	let books: any[] = [];
	let loading = false;
	let error = '';

	async function searchBooks(q: string) {
		loading = true;
		error = '';
		books = [];

		try {
			const isISBN = /^\d{10}(\d{3})?$/.test(q);
			const url = isISBN
				? `https://openlibrary.org/search.json?isbn=${q}`
				: `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}`;

			const res = await fetch(url);

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
		searchBooks(query);
	}
</script>

<h1 class="BorrowTitleText">Borrow</h1>

{#if !isLoggedIn}
	<p class="BorrowText">Scan or type in your library card to continue,</p>
	<div class="input-group mb-3 BorrowInputText">
		<input
			type="text"
			class="form-control"
			placeholder="Library card no."
			aria-label="Username"
			aria-describedby="basic-addon1"
		/>
		<button class="btn btn-outline-secondary" type="button" id="button-addon1">Done</button>
	</div>

	<p class="BorrowText">
		or <a href="/login">login</a>
		with your account
	</p>
{:else}
	<p class="BorrowText">Scan or type in the ISBN no. of the book to continue.</p>
	<form class="d-flex borrow" role="form" on:submit|preventDefault={handleSubmit}>
		<div class="input-group mb-3 BorrowInputText">
			<input
				bind:value={query}
				type="text"
				class="form-control"
				placeholder="book ISBN no."
				aria-label="Username"
				aria-describedby="basic-addon1"
			/>
			<button
				on:click={() => searchBooks(query)}
				class="btn btn-outline-secondary"
				type="button"
				id="button-addon1"
			>
				Done
			</button>
		</div>
	</form>
	<div class="results">
		{#each books as book}
			<BookBorrowCard
				name={book.name}
				author={book.author}
				year={book.year}
				publisher={book.publisher}
				imageUrl={book.imageUrl}
			/>
		{/each}
	</div>

	{#if error}
		<p class="BorrowText" style="color:red">{error}</p>
	{/if}
	<LogOutButton />
{/if}

<a href="/" class="BackButton">
	<button type="button" class="btn btn-primary"><i class="bi bi-arrow-return-left" /></button>
</a>

<style>
	.BorrowTitleText {
		font-weight: bold;
		text-align: center;
	}
	.BorrowInputText {
		padding: 5px;
		width: 50vw;
		margin: 0 auto;
	}
	.BorrowText {
		text-align: center;
	}
	.BackButton {
		margin: 0 auto;
		display: block;
		text-align: center;
	}
	.results {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
	}
</style>
