<script lang="ts">
	import { goto } from '$app/navigation';
	import BackButton from '$lib/backButton.svelte';
	import { onMount } from 'svelte';

	const allowedDomain = ''; // e.g., '@example.com'
	let name = '';
	let email = '';
	let password = '';
	let errorMessage = '';
	import { currentUser } from '$lib/stores/user';

	$: isLoggedIn = !!$currentUser;

	onMount(() => {
		if ($currentUser) {
			goto('/');
		}
	});

	// SIGN UP
	async function signUp() {
		errorMessage = '';

		if (!email.endsWith(allowedDomain)) {
			errorMessage = `Only emails ending with ${allowedDomain} are allowed.`;
			return;
		}
		if (!name.trim()) {
			errorMessage = 'Name is required';
			return;
		}

		try {
			// CALL THE BRIDGE INSTEAD OF FETCH
			const data = await window.electron.invoke('auth:register', { name, email, password });

			if (!data.success) {
				errorMessage = data.error || 'Registration failed.';
				return;
			}

			if (data.admin) {
				alert('Root Admin account created! Please log in.');
			} else {
				alert('Account created! An admin must verify your account.');
			}
			goto('/');
		} catch (err) {
			errorMessage = 'Database connection failed.';
		}
	}

	// LOGIN
	async function login(event) {
		event.preventDefault();
		errorMessage = '';

		try {
			// CALL THE BRIDGE INSTEAD OF FETCH
			const data = await window.electron.invoke('auth:login', { email, password });

			if (!data.success) {
				errorMessage = data.error || 'Login failed.';
				return;
			}

			if (!data.verified) {
				errorMessage = 'Your account is not verified yet.';
				return;
			}

			currentUser.set({
				id: data.id,
				email: data.email,
				name: data.name,
				verified: data.verified,
				admin: data.admin,
			});

			alert('Logged in successfully!');
			goto('/');
		} catch (err) {
			errorMessage = 'Something went wrong.';
		}
	}
</script>

<h1 class="ProfileTitleText">Login</h1>

<form class="LoginDiv" on:submit={login}>
	<div class="mb-3 InputText">
		<label for="name" class="form-label">Name</label>
		<input
			type="text"
			class="form-control"
			id="name"
			placeholder="John Smith"
			bind:value={name}
		/>
		<div id="nameHelp" class="form-text">Name not required for login.</div>
	</div>
	<div class="mb-3 InputText">
		<label for="exampleInputEmail1" class="form-label">Email address</label>
		<input
			type="email"
			class="form-control"
			id="exampleInputEmail1"
			placeholder="john.smith@example.com"
			bind:value={email}
			required
		/>
		<div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
	</div>
	<div class="mb-3 InputText">
		<label for="exampleInputPassword1" class="form-label">Password</label>
		<input
			type="password"
			class="form-control"
			id="exampleInputPassword1"
			bind:value={password}
			required
		/>
	</div>
	<button type="submit" class="btn btn-primary">Login</button>
	<button type="button" class="btn btn-secondary" on:click={signUp}>Sign Up</button>
</form>

{#if errorMessage}
	<p style="color:red; text-align:center;">{errorMessage}</p>
{/if}

<BackButton />

<style>
	.ProfileTitleText {
		font-weight: bold;
		text-align: center;
	}
	.LoginDiv {
		padding: 10px;
		margin: 0 auto;
		max-width: 600px;
	}
	.InputText {
		width: 50vw;
	}
</style>
