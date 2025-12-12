<script lang="ts">
	import { currentUser } from '$lib/stores/user';

	function logout() {
		currentUser.set(null); // Clear session store
	}
</script>

<button class="btn btn-danger" on:click={logout}>Logout</button>

<style>
	button {
		margin-top: 10px;
		margin-bottom: 10px;
		margin: 0 auto;
		display: block;
	}
</style>
