<script lang="ts">
	export let name: string;
	export let author: string;
	export let publisher: string;
	export let year: int;
	export let imageUrl: string;
</script>

<div class="bookCard">
	<img src={imageUrl} alt={name} class="bookCardImage" />
	<h5>{name}</h5>
	<h6>{author}</h6>
	<p>{publisher}</p>
	<p>{year}</p>
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
