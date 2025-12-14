<script lang="ts">
	import { currentUser } from '$lib/stores/user';
	import { goto } from '$app/navigation';

	function logout() {
		currentUser.set(null);
		goto('/');
	}
</script>

<button class="btn btn-danger" on:click={logout}>Logout</button>

<style>
	button {
		margin: 10px auto;
		display: block;
	}
</style>
