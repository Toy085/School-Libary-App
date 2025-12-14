<script lang="ts">
	import { currentUser } from '$lib/stores/user';
	import { get } from 'svelte/store';
	import LogOutButton from '$lib/logout.svelte';

	type BookEntry = {
		id: number;
		title: string;
		ISBN: string;
		user_id: number | null;
		user_name: string | null;
		borrowed_at: string | null;
		returned_at: string | null;
	};

	let user;
	let bookISBN = '';
	let books: BookEntry[] = [];
	$: user = $currentUser;

	$: isLoggedIn = !!user;

	loadBooks();
	async function loadBooks() {
		const res = await fetch('/api/books');
		if (res.ok) {
			books = await res.json();
		} else {
			alert('Failed to load books');
		}
	}

	async function returnBook(b: BookEntry) {
		const res = await fetch('/api/return', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ bookId: b.id }),
		});

		if (res.ok) {
			alert(`Successfully returned "${b.title}"!`);
			bookISBN = '';
			await loadBooks(); // Refresh the list from the server
		} else {
			const errorData = await res.json();
			alert(`Failed to return book: ${errorData.error || 'Server error'}`);
		}
	}

	async function handleReturn() {
		if (!bookISBN) {
			alert('Please enter a book ISBN.');
			return;
		}
		const bookToReturn = books.find((b) => String(b.ISBN) === bookISBN && b.user_id !== null);

		if (bookToReturn) {
			if (
				!confirm(
					`Return book "${bookToReturn.title}" borrowed by ${bookToReturn.user_name}?`,
				)
			)
				return;
			await returnBook(bookToReturn);
		} else {
			const foundBookByISBN = books.find((b) => String(b.ISBN) === bookISBN);

			if (!foundBookByISBN) {
				alert(`Error: No book found with ISBN "${bookISBN}" in the catalog.`);
			} else if (foundBookByISBN.user_id === null) {
				alert(
					`Error: Book "${foundBookByISBN.title}" is already available (not borrowed).`,
				);
			} else {
				alert(
					`Error: Book "${foundBookByISBN.title}" appears to be borrowed but has a return date recorded. Contact an administrator.`,
				);
			}
		}
	}
</script>

<h1 class="ReturnTitleText">Return</h1>

{#if isLoggedIn}
	<p>Welcome, {$currentUser.name}! Scan the book you'd like to return.</p>
	<p class="BorrowText">Scan or type in the ISBN no. of the book to continue.</p>
	<div class="input-group mb-3 BorrowInputText">
		<input
			type="text"
			class="form-control"
			placeholder="book ISBN no."
			aria-label="Username"
			aria-describedby="basic-addon1"
			bind:value={bookISBN}
			on:keydown={(e) => {
				if (e.key === 'Enter') handleReturn();
			}}
		/>
		<button
			class="btn btn-outline-secondary"
			type="button"
			id="button-addon1"
			on:click={handleReturn}
		>
			Done
		</button>
	</div>
	<LogOutButton />
{:else}
	<p>
		Please <a href="/login">log in</a>
		to access this page.
	</p>
{/if}

<a href="/" class="BackButton">
	<button type="button" class="btn btn-primary"><i class="bi bi-arrow-return-left" /></button>
</a>

<style>
	* {
		text-align: center;
	}
	.ReturnTitleText {
		text-align: center;
		font-weight: bold;
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
</style>
