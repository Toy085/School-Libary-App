<script lang="ts">
	import { onMount } from 'svelte';
	export let book: {
		title: string;
		author: string;
		ISBN: number | string;
		imageUrl: string;
	};

	let finalImageUrl = book.imageUrl;
	const customPlaceholder =
		'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';

	function checkImageSize(event: Event) {
		const img = event.target as HTMLImageElement;

		// Define the minimum size threshold for a real book cover (e.g., 50 pixels wide)
		const MIN_WIDTH = 50;

		if (img.naturalWidth < MIN_WIDTH) {
			finalImageUrl = customPlaceholder;
		}
	}
	function handleError() {
		finalImageUrl = customPlaceholder;
	}
</script>

<div class="bookCard">
	<img
		src={finalImageUrl}
		alt={book.title}
		class="bookCardImage"
		on:load={checkImageSize}
		on:error={handleError}
	/>
	<h5>{book.title}</h5>
	<h6>{book.author}</h6>
	<p>{book.ISBN}</p>
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
		height: 300px;
		width: 12rem;
		max-width: 100%;
		background-color: var(--bs-teal);
		border-radius: var(--bs-border-radius);
		margin: 10px;
		transition: transform 0.2s, box-shadow 0.2s;
	}
	.bookCard:hover {
		transform: scale(1.05);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
	}
	.bookCardImage {
		border-radius: var(--bs-border-radius);
		height: 80%;
		width: 100%;
		max-height: 200px;
		object-fit: contain;
		display: block;
		margin: 0 auto;
		padding-top: 5px;
	}
</style>
