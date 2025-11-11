<script lang="ts">
	import { onMount } from 'svelte';
	import BookSearchCard from '$lib/BookSearchCard.svelte';

	let query = '';
	let books: any[] = [];

	async function searchBooks(e: Event) {}

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
