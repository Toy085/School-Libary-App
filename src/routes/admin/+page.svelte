<script>
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/stores/user';
	let user;
	$: user = $currentUser;
	$: isLoggedIn = !!user;
</script>

<h1>Admin Page</h1>

{#if isLoggedIn && user.admin === 1}
	<p>Welcome to the admin page, {$currentUser.email}!</p>
	<!-- Admin functionalities go here -->
{:else}
	<p>You do not have permission to access this page.</p>
{/if}
