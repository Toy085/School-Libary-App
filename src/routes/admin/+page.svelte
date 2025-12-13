<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LogOutButton from '$lib/logout.svelte';

	import { currentUser } from '$lib/stores/user';
	let user;
	let users = [];
	$: user = $currentUser;
	$: isLoggedIn = !!user;
	$: if (user?.admin === 1) {
		loadUsers();
	}

	async function loadUsers() {
		const res = await fetch('/api/users');
		users = await res.json();
	}
	function updateUser(id, props) {
		users = users.map((u) => (u.id === id ? { ...u, ...props } : u));
	}

	async function verifyUser(u) {
		await fetch('/api/verify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: u.id }),
		});

		updateUser(u.id, { verified: 1 });
	}
	async function adminUser(u) {
		await fetch('/api/makeadmin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: u.id }),
		});

		updateUser(u.id, { admin: 1 });
	}

	async function deleteUser(u) {
		if (!confirm(`Delete user ${u.email}?`)) return;

		await fetch('/api/deleteuser', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: u.id }),
		});

		users = users.filter((user) => user.id !== u.id);
	}
</script>

<h1>Admin Page</h1>

{#if isLoggedIn && user.admin === 1}
	<p>Welcome to the admin page, {$currentUser.name}!</p>
	<div class="table-container">
		<table class="user-table">
			<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>Email</th>
					<th>Verified?</th>
					<th>Admin?</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each users as u}
					<tr>
						<td>{u.id}</td>
						<td>{u.name}</td>
						<td>{u.email}</td>
						<td>{u.verified ? 'Yes' : 'No'}</td>
						<td>{u.admin ? 'Yes' : 'No'}</td>
						<td>
							{#if !u.verified}
								<button class="btn btn-primary" on:click={() => verifyUser(u)}>
									Verify
								</button>
							{/if}
							{#if !u.admin}
								<button class="btn btn-primary" on:click={() => adminUser(u)}>
									Make Admin
								</button>
							{/if}
							<button class="btn btn-danger" on:click={() => deleteUser(u)}>
								Delete
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<LogOutButton />
{:else}
	<p>You do not have permission to access this page.</p>
{/if}

<a href="/" class="BackButton">
	<button type="button" class="btn btn-primary"><i class="bi bi-arrow-return-left" /></button>
</a>

<style>
	* {
		text-align: center;
	}
	.table-container {
		max-height: 400px;
		overflow-y: auto;
		overflow-x: auto;
		margin: 0 auto;
		width: 100%;
		max-width: 1200px;
	}
	.user-table {
		width: 100%;
		max-height: 50px;
		max-width: 1200px;
		margin: 0 auto;
		border-collapse: collapse;
		text-align: left;
	}

	.user-table th,
	.user-table td {
		border: 2px solid black;
		padding: 0.75rem 1rem;
	}

	.user-table th {
		background-color: grey;
	}

	.user-table tr:nth-child(even) {
		background-color: whitesmoke;
	}

	.BackButton {
		margin: 5 auto;
		display: block;
		text-align: center;
	}
</style>
