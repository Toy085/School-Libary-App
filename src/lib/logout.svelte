<script lang="ts">
	import { currentUser } from '$lib/stores/user';

	function logout() {
		currentUser.set(null); // Clear session store
	}
</script>

<button class="btn btn-danger" on:click={logout}>Logout</button>

<style>
	button {
		margin: 10px auto;
		display: block;
	}
</style>
