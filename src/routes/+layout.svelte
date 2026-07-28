<script>
	import '../app.css';
	import PageTransitionOverlay from '$components/PageTransitionOverlay.svelte';
	import FinderWindow from '$components/FinderWindow.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let wallpaperColor = '#ff8c42'; // Default orange

	// Spotify player lives HERE, in the layout, so it survives page navigation
	// and the music keeps playing everywhere. State is remembered across visits.
	let showPlayer = false;
	let playerX = 40;
	let playerY = 90;

	onMount(() => {
		if (typeof window !== 'undefined') {
			const savedColor = localStorage.getItem('wallpaperColor');
			if (savedColor) wallpaperColor = savedColor;
			showPlayer = localStorage.getItem('playerOpen') === '1';
		}
	});

	function togglePlayer() {
		showPlayer = !showPlayer;
		try { localStorage.setItem('playerOpen', showPlayer ? '1' : '0'); } catch {}
	}
	function closePlayer() {
		showPlayer = false;
		try { localStorage.setItem('playerOpen', '0'); } catch {}
	}

	// Update body background when wallpaper color changes
	$: if (typeof window !== 'undefined' && wallpaperColor) {
		document.body.style.background = wallpaperColor;
	}
</script>

<svelte:head>
	<title>rhea web</title>
	<meta name="description" content="A fun and eclectic personal website showcasing rad stuff, writing, music, comedy, and art" />
</svelte:head>

<main>
	<slot />
</main>

<!-- Global music toggle — always reachable, on every page -->
<button class="global-player-btn" on:click={togglePlayer} title={showPlayer ? 'Hide player' : 'Music'} aria-label="Music player">♪</button>

{#if showPlayer}
	<FinderWindow title="♪ browsing playlist" bind:x={playerX} bind:y={playerY} w={340} h={420} z={9000}
		on:focus={() => {}} on:close={closePlayer} on:minimize={closePlayer}>
		<iframe
			title="Rhea's playlist"
			src="https://open.spotify.com/embed/playlist/3W0mwmJo0Xx3PxabebBTtE?utm_source=generator&theme=0"
			width="100%" height="352" frameborder="0"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			loading="lazy"
			style="border:none;"
		></iframe>
	</FinderWindow>
{/if}

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: Arial, sans-serif;
		background: #ff8c42;
		min-height: 100vh;
		position: relative;
		overflow-x: hidden;
	}

	:global(body::before) {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image:
			radial-gradient(2px 2px at 20px 30px, #ff6b6b, transparent),
			radial-gradient(2px 2px at 40px 70px, #4ecdc4, transparent),
			radial-gradient(1px 1px at 90px 40px, #45b7d1, transparent),
			radial-gradient(1px 1px at 130px 80px, #96ceb4, transparent),
			radial-gradient(2px 2px at 160px 30px, #feca57, transparent);
		background-repeat: repeat;
		background-size: 200px 100px;
		opacity: 0.3;
		z-index: -1;
		animation: twinkle 20s linear infinite;
	}

	@keyframes twinkle {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.6; }
	}

	main {
		min-height: 100vh;
		position: relative;
		z-index: 1;
	}

	/* Always-present music button, bottom-left above the taskbar */
	.global-player-btn {
		position: fixed;
		left: 14px;
		bottom: 8px;
		z-index: 9001;
		width: 30px;
		height: 26px;
		background: #1db954;
		border: 1px solid #000;
		color: #000;
		font-size: 1.05rem;
		line-height: 1;
		cursor: pointer;
	}
	.global-player-btn:hover { background: #1ed760; }
</style>
