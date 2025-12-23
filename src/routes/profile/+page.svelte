<script lang="ts">
	import { currentUser } from '$lib/stores/user';
	import LogOutButton from '$lib/logout.svelte';
	import BackButton from '$lib/backButton.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user;
	$: user = $currentUser;
	$: isLoggedIn = !!user;

	onMount(() => {
		if (!$currentUser) {
			goto('/login');
		}
	});

	let libraryCardNumber = user?.library_card_number || '';

	async function updateUser(event) {
		event.preventDefault();

		try {
			const res = await fetch('/api/updateuser', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					library_card_number: libraryCardNumber,
				}),
			});

			if (res.ok) {
				const updatedUserData = await res.json();

				currentUser.set(updatedUserData);

				alert('Profile updated successfully!');
			} else {
				const errorData = await res.json();
				alert(`Error updating profile: ${errorData.message || res.statusText}`);
			}
		} catch (error) {
			console.error('Network or system error:', error);
			alert('An unexpected error occurred during update.');
		}
	}
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
	<!--<form on:submit={updateUser}>
		<div class="input-group mb-3">
			<label for="library">Library Card Number:</label>
			<input
				type="text"
				class="form-control"
				id="library"
				name="library"
				bind:value={libraryCardNumber}
			/>
		</div>
		<br />

		<button type="submit" class="btn btn-success">Update Profile</button>
	</form>-->
	<LogOutButton />
{:else}
	<p>
		Please
		<a href="/login">log in</a>
		to access this page.
	</p>
{/if}

<BackButton />

<style>
	* {
		text-align: center;
	}
	a {
		margin: 5px auto;
		display: block;
		text-align: center;
	}
</style>
