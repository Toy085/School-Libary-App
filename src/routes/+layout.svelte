<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/firebase';
	import { onAuthStateChanged, type User } from 'firebase/auth';
	import { currentUser } from '$lib/stores/user';

	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
			currentUser.set(user);
		});

		return () => unsubscribe(); // clean up on unmount
	});
	let ready: boolean = false;
	onMount(() => (ready = true));
</script>

<div class="dragbar" />

{#if ready}
	<slot />
{/if}

<div class="bg" />
<div class="bg bg2" />
<div class="bg bg3" />

<style>
	.dragbar {
		-webkit-app-region: drag;
		position: absolute;
		z-index: 100;
		height: 40px;
		width: 100%;
	}

	.bg {
		animation: slide 3s ease-in-out infinite alternate;
		background-image: linear-gradient(-60deg, rgb(204, 201, 51) 50%, #09f 50%);
		bottom: 0;
		left: -50%;
		opacity: 0.5;
		position: fixed;
		right: -50%;
		top: 0;
		z-index: -1;
	}

	.bg2 {
		animation-direction: alternate-reverse;
		animation-duration: 4s;
	}

	.bg3 {
		animation-duration: 5s;
	}

	@keyframes slide {
		0% {
			transform: translateX(-25%);
		}
		100% {
			transform: translateX(25%);
		}
	}
</style>
