<script lang="ts">
	import { browser } from '$app/environment';

	import { currentUser } from '$lib/stores/user';
	let user;
	$: user = $currentUser;

	$: isLoggedIn = !!user;

	let desktop: string;

	if (window.electron && browser) {
		window.electron.receive('from-main', (data: any) => {
			desktop = `Received Message "${data}" from Electron`;
			console.log(desktop);
		});
	}

	const agent = window.electron ? 'Electron' : 'Browser';
</script>

<main>
	<h1 style="font-size: 50px; font-weight: bold;">Welcome!</h1>

	<div class="container text-center container-buttons">
		<div class="row align-items-center justify-content-between gap-3">
			<div class="col-auto">
				<a href="/borrow">
					<button type="button" class="btn btn-primary">
						<i class="bi bi-book" />
						Borrow
					</button>
				</a>
			</div>
			<div class="col-auto align-self-center">
				<a href="return">
					<button type="button" class="btn btn-primary">
						<i class="bi bi-arrow-return-right" />
						Return
					</button>
				</a>
			</div>
			<div class="col-auto">
				<a href="profile">
					<button type="button" class="btn btn-primary">
						<i class="bi bi-person-circle" />
						Profile
					</button>
				</a>
			</div>
			<div class="col-auto">
				<a href="search">
					<button type="button" class="btn btn-primary">
						<i class="bi bi-search" />
						Search
					</button>
				</a>
			</div>
		</div>
	</div>
</main>

{#if isLoggedIn}
	{#if $currentUser.admin === 1}
		<h2>ADMIN ACCOUNT: {$currentUser.name}</h2>
		<a href="/admin">
			<button type="button" class="btn btn-primary">
				<i class="bi" />
				Admin Panel
			</button>
		</a>
	{:else}
		<h2>
			Logged in as: <strong>{$currentUser.name}</strong>
		</h2>
	{/if}
{/if}

<style>
	@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css');
	:root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}

	:global(body) {
		margin: 0;
		padding: 0;
	}

	main {
		padding: 2em 1em 1em 1em;
		text-align: center;
		animation: fade 1s;
	}

	.container-buttons {
		background-color: var(--bs-teal);
		border-radius: var(--bs-border-radius-xxl);
		width: 50vw;
		height: 100px;
		margin-top: 20vh;
		align-items: center;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		justify-content: center;
	}

	.row {
		display: flex; /* ensures row is a flex container */
		justify-content: center; /* center buttons */
		gap: 1rem; /* even spacing between buttons */
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
