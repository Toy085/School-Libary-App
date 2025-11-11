<script lang="ts">
	import { auth } from '$lib/firebase';
	import { signOut } from 'firebase/auth';
	import { currentUser } from '$lib/stores/user';

	async function logout() {
		try {
			await signOut(auth);
			currentUser.set(null); // update store
			alert('Logged out successfully!');
		} catch (err: any) { // Type annotation valid in TS
			console.error('Logout failed:', err.message);
		}
	}
</script>

<button class="btn btn-danger" on:click={logout}>Logout</button>

<style>
	button {
		margin-top: 10px;
	}
</style>
