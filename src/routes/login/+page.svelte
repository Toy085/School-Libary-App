<script lang="ts">
	const allowedDomain = ''; // e.g., '@example.com'
	let name = '';
	let email = '';
	let password = '';
	let errorMessage = '';
	import { currentUser } from '$lib/stores/user';
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
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				errorMessage = data.error || 'Registration failed.';
				return;
			}

			alert('Account created! An admin must verify your account before you can log in.');
		} catch (err) {
			errorMessage = 'Something went wrong.';
		}
	}

	// LOGIN
	async function login(event: Event) {
		event.preventDefault();
		errorMessage = '';

		console.log({ email, password });
		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
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
			required
		/>
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

<a href="/" class="BackButton">
	<button type="button" class="btn btn-primary"><i class="bi bi-arrow-return-left" /></button>
</a>

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

	.BackButton {
		margin: 0 auto;
		display: block;
		text-align: center;
	}
</style>
