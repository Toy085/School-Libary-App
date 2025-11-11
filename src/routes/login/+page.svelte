<script lang="ts">
	import { auth } from '$lib/firebase';
	import {
		createUserWithEmailAndPassword,
		signInWithEmailAndPassword,
		sendEmailVerification,
	} from 'firebase/auth';

	let email = '';
	let password = '';
	const allowedDomain = '@osloskolen.no';
	let errorMessage = '';

	async function signUp() {
		errorMessage = '';

		if (!email.endsWith(allowedDomain)) {
			errorMessage = `Only emails ending with ${allowedDomain} are allowed.`;
			return;
		}

		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			// Send email verification
			await sendEmailVerification(user);

			alert(
				'User created successfully! Please check your email to verify your account before logging in.',
			);
		} catch (err: any) {
			errorMessage = err.message;
		}
	}

	async function login(event: Event) {
		event.preventDefault(); // prevent page reload
		errorMessage = '';

		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			if (!user.emailVerified) {
				alert('Please verify your email before logging in.');
				await auth.signOut(); // log out unverified user
				return;
			}

			alert('Logged in successfully!');
		} catch (err: any) {
			errorMessage = err.message;
		}
	}
</script>

<h1 class="ProfileTitleText">Login</h1>

<form class="LoginDiv" on:submit={login}>
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
