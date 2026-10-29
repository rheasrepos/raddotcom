<script>
	// "WPM" popup — the one-minute typing test, popping up like a retro ad once
	// per session, otherwise living behind the wpm button (top-right). The
	// test itself is WpmTest.svelte; the full-page version is /wpm.
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { wpmOpen } from '$lib/wpm.js';
	import WpmTest from './WpmTest.svelte';

	let open = false;
	$: if ($wpmOpen) { open = true; wpmOpen.set(false); }
	// not on /wpm itself — the page IS the widget there
	$: onPage = $page.url.pathname.startsWith('/wpm');

	onMount(() => {
		try {
			localStorage.removeItem('omDismissed'); // an older build could hide the button for good
			if (!sessionStorage.getItem('omShown') && !onPage) {
				sessionStorage.setItem('omShown', '1');
				setTimeout(() => (open = true), 1400);
			}
		} catch {}
	});
	// '–' minimizes to the wpm button; nothing is ever closed for good
	function dismiss() { open = false; }
</script>

{#if !onPage}
	{#if !open}
		<button class="om-fab" on:click={() => (open = true)} title="WPM — one-minute typing test">wpm</button>
	{:else}
		<div class="om-ad">
			<div class="om-bar">
				<span>wpm — www.rhea.com</span>
				<span class="om-bar-r">
					<a class="om-full" href="/wpm" title="Leaderboard + full page">full page ↗</a>
					<button class="om-x" on:click={dismiss} title="Minimize" aria-label="Minimize">–</button>
				</span>
			</div>
			<WpmTest />
		</div>
	{/if}
{/if}

<style>
	.om-fab {
		position: fixed; right: 14px; top: 62px; z-index: 9400;
		background: #c0c0c0; color: #000;
		border: 2px solid #000; border-color: #fff #808080 #808080 #fff;
		padding: 7px 11px; font: inherit; font-size: 0.78rem; cursor: pointer;
		box-shadow: 2px 2px 0 rgba(0,0,0,0.35);
	}
	.om-fab:hover { background: #cfcfcf; }
	.om-ad {
		position: fixed; right: 14px; top: 62px; z-index: 9400;
		max-height: calc(100vh - 120px); overflow-y: auto;
		width: min(420px, 92vw);
		background: #c0c0c0; border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0,0,0,0.45);
		font-family: var(--font-family, monospace);
		animation: omPop 0.18s ease-out;
	}
	@keyframes omPop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
	.om-bar {
		display: flex; align-items: center; justify-content: space-between;
		padding: 6px 10px; background: #c0c0c0; color: #000; border-bottom: 2px solid #000; font-size: 0.8rem; font-weight: 700;
	}
	.om-bar-r { display: flex; align-items: center; gap: 10px; }
	.om-full { font-size: 0.72rem; font-weight: 400; color: #000; }
	.om-x { background: none; border: none; color: #000; font-size: 1.1rem; line-height: 1; cursor: pointer; }
	@media (max-width: 600px) { .om-fab, .om-ad { right: 8px; top: 58px; } }
</style>
