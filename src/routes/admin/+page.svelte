<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LogOutButton from '$lib/logout.svelte';

	let tableType = 0; // 0: users, 1: books

	import { currentUser } from '$lib/stores/user';
	let user;
	let books = [];
	let users = [];
	$: user = $currentUser;
	$: isLoggedIn = !!user;
	$: if (user?.admin === 1) {
		loadUsers();
		loadBooks();
	}

	async function loadUsers() {
		const res = await fetch('/api/users');
		users = await res.json();
	}
	async function loadBooks() {
		const res = await fetch('/api/books');
		if (res.ok) {
			books = await res.json();
		} else {
			alert('Failed to load books');
		}
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

	// Inside your <script> block in +page.svelte

	// ... (Existing functions like deleteUser, etc.)

	async function returnBook(b) {
		if (!b.user_id) {
			alert('This book is not currently borrowed.');
			return;
		}

		if (!confirm(`Return book "${b.title}" borrowed by ${b.user_name}?`)) return;

		const res = await fetch('/api/return', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ bookId: b.id }),
		});

		if (res.ok) {
			await loadBooks();
		} else {
			const errorData = await res.json();
			alert(`Failed to return book: ${errorData.error || 'Server error'}`);
		}
	}
</script>

<h1>Admin Page</h1>

{#if isLoggedIn && user.admin === 1}
	<p>Welcome to the admin page, {$currentUser.name}!</p>
	<div class="radio-group">
		<input
			type="radio"
			bind:group={tableType}
			value={0}
			class="btn-check"
			name="options"
			id="option1"
			autocomplete="off"
			checked
		/>
		<label class="btn btn-secondary" for="option1">Users</label>
		<input
			type="radio"
			bind:group={tableType}
			value={1}
			class="btn-check"
			name="options"
			id="optionBooks"
			autocomplete="off"
		/>
		<label class="btn btn-secondary" for="optionBooks">Books</label>
	</div>

	<div class="table-container">
		{#if tableType === 0}
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
		{:else if tableType === 1}
			<table class="book-table">
				<thead>
					<tr>
						<th>User ID</th>
						<th>User Name</th>
						<th>User Email</th>
						<th>Book Name</th>
						<th>Borrowed</th>
						<th>Returned</th>
						<th>ISBN</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each books as b}
						<tr>
							<td>{b.user_id}</td>
							<td>{b.user_name}</td>
							<td>{b.user_email}</td>
							<td>{b.title}</td>
							<td>{b.borrowed_at}</td>
							<td>{b.returned_at}</td>
							<td>{b.ISBN}</td>
							<td>
								<button
									class="btn btn-danger"
									on:click={() => returnBook(b)}
									disabled={!b.user_id || b.returned_at}
								>
									Return
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
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
	.radio-group {
		display: flex;
		justify-content: center;
		gap: 10px;
		margin-bottom: 10px;
	}
	.table-container {
		max-height: 500px;
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

	.book-table {
		width: 100%;
		max-height: 50px;
		max-width: 1200px;
		margin: 0 auto;
		border-collapse: collapse;
		text-align: left;
	}

	.book-table th,
	.book-table td {
		border: 2px solid black;
		padding: 0.75rem 1rem;
	}

	.book-table th {
		background-color: grey;
	}

	.book-table tr:nth-child(even) {
		background-color: whitesmoke;
	}

	.BackButton {
		margin: 5 auto;
		display: block;
		text-align: center;
	}
</style>
