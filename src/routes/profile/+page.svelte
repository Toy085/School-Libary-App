<script lang="ts">
	import { currentUser } from '$lib/stores/user';
	import { get } from 'svelte/store';
	import LogOutButton from '$lib/logout.svelte';

	let user;
	$: user = $currentUser;

	$: isLoggedIn = !!user;
</script>

<h1>Profile</h1>

{#if isLoggedIn}
	<p>Welcome, {$currentUser.name}!</p>
	{#if $currentUser.admin === 1}
		<a href="/admin">
			<button type="button" class="btn btn-primary">
				<i class="bi" />
				Admin Panel
			</button>
		</a>
	{/if}
	<LogOutButton />
{:else}
	<p>
		Please
		<a href="/login">log in</a>
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
	a {
		margin: 5px auto;
		display: block;
		text-align: center;
	}
	.BackButton {
		margin: 0 auto;
		display: block;
		text-align: center;
	}
</style>
