<script>
	import '../app.css';
	import PageTransitionOverlay from '$components/PageTransitionOverlay.svelte';
	import FinderWindow from '$components/FinderWindow.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let wallpaperColor = '#ff8c42'; // Default orange

	// Spotify player lives HERE, in the layout, so it survives page navigation
	// and the music keeps playing everywhere. The iframe stays MOUNTED whenever
	// the player isn't fully closed — minimizing just hides the window, so the
	// music keeps going. State is remembered across visits.
	let playerMode = 'closed'; // 'closed' | 'open' | 'min'
	let playerX = 40;
	let playerY = 90;

	onMount(() => {
		if (typeof window !== 'undefined') {
			const savedColor = localStorage.getItem('wallpaperColor');
			if (savedColor) wallpaperColor = savedColor;
			const m = localStorage.getItem('playerMode');
			if (m === 'open' || m === 'min') playerMode = m;
		}
	});

	function setPlayer(mode) {
		playerMode = mode;
		try { localStorage.setItem('playerMode', mode); } catch {}
	}
	function togglePlayer() { setPlayer(playerMode === 'closed' ? 'open' : 'closed'); }

	// Update body background when wallpaper color changes
	$: if (typeof window !== 'undefined' && wallpaperColor) {
		document.body.style.background = wallpaperColor;
	}
</script>

<svelte:head>
	<title>www.rhea.com</title>
</svelte:head>

<main>
	<slot />
</main>

<!-- Global music toggle — always reachable, on every page -->
{#if playerMode === 'closed'}
	<button class="global-player-btn" on:click={togglePlayer} title="Music" aria-label="Music player">♪</button>
{:else if playerMode === 'min'}
	<button class="global-player-btn playing" on:click={() => setPlayer('open')} title="Show player" aria-label="Show player">♪ ▸</button>
{/if}

<!-- Mounted whenever not fully closed, so minimizing/navigating never stops the music -->
{#if playerMode !== 'closed'}
	<FinderWindow title="♪ browsing playlist" hidden={playerMode === 'min'} bind:x={playerX} bind:y={playerY} w={340} h={420} z={9000}
		on:focus={() => {}} on:close={() => setPlayer('closed')} on:minimize={() => setPlayer('min')}>
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
	.global-player-btn.playing {
		width: auto;
		padding: 0 8px;
		font-size: 0.85rem;
		animation: playerPulse 1.4s ease-in-out infinite;
	}
	@keyframes playerPulse { 50% { background: #1ed760; } }
</style>
