<script>
	import { goto } from '$app/navigation';
	import LogOutButton from '$lib/logout.svelte';
	import { currentUser } from '$lib/stores/user';
	let user;
	$: user = $currentUser;
	$: isLoggedIn = !!user;
</script>

<h1>Admin Page</h1>

{#if isLoggedIn && user.admin === 1}
	<p>Welcome to the admin page, {$currentUser.email}!</p>
	<!-- Admin functionalities go here -->
	<LogOutButton />
{:else}
	<p>You do not have permission to access this page.</p>
{/if}

<a href="/" class="BackButton">
	<button type="button" class="btn btn-primary"><i class="bi bi-arrow-return-left" /></button>
</a>

<style>
	* {
		text-align: center;
	}
	.BackButton {
		margin: 5 auto;
		display: block;
		text-align: center;
	}
</style>
