<script lang="ts">
	import { currentUser } from '$lib/stores/user';
	import { get } from 'svelte/store';
	import LogOutButton from '$lib/logout.svelte';

	let user;
	$: user = $currentUser; // reactive

	$: isLoggedIn = !!user;
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
		/>
		<button class="btn btn-outline-secondary" type="button" id="button-addon1">Done</button>
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
