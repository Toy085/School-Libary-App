<script lang="ts">
	import { currentUser } from '$lib/stores/user';
	import { get } from 'svelte/store';
	export let name: string;
	export let author: string;
	export let ISBN: number | string;
	export let year: number | string;
	export let imageUrl: string;

	let loading = false;

	async function borrowBook() {
		if (loading) return;
		loading = true;

		try {
			const user = get(currentUser);
			if (!user) {
				alert('You must be logged in to borrow a book.');
				return;
			}

			const res = await fetch('/api/borrow', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: name,
					author,
					ISBN,
					userId: user.id,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				alert('Error: ' + (data.error || 'Unknown error'));
				return;
			}

			alert(`You have borrowed "${name}" successfully!`);
		} catch (err: any) {
			alert('Error: ' + (err.message || 'Unknown error'));
		} finally {
			loading = false;
		}
	}
</script>

<div class="bookCard">
	<img src={imageUrl} alt={name} class="bookCardImage" />
	<h5>{name}</h5>
	<h6>{author}</h6>
	<h6>{ISBN || 'No ISBN'}</h6>
	<p>{year || 'N/A'}</p>
	<button on:click={borrowBook} class="btn btn-primary">Borrow</button>
</div>

<style>
	h5,
	h6 {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	p {
		padding: 0;
		margin: 0;
	}

	.bookCard {
		height: 350px;
		width: 14rem;
		max-width: 100%;
		background-color: var(--bs-teal);
		border-radius: var(--bs-border-radius);
		margin: 10px;
		transition: transform 0.2s, box-shadow 0.2s;
		padding: 5px;
	}
	.bookCard:hover {
		transform: scale(1.05);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	}
	.bookCardImage {
		height: 200px;
		width: 100%;
		object-fit: contain;
	}
</style>
