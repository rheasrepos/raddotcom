<script>
	import { pageTransition, transitionActions } from '../lib/pageTransition.js';
	import { onMount } from 'svelte';

	let isVisible = false;

	// Watch for page transitions
	$: if ($pageTransition.isLoading) {
		isVisible = true;
	} else {
		// Hide immediately when transition completes
		isVisible = false;
	}

	onMount(() => {
		// Complete any lingering transitions on mount
		transitionActions.completeTransition();
	});
</script>

{#if isVisible}
	<div class="transition-overlay" class:visible={isVisible}>
		<!-- Old-school "window opening" wipe: a page bursts open from the
		     middle of the screen — first a thin slit, then it snaps wide.
		     No spinner, no loading bar. -->
		<div class="win-page"></div>
	</div>
{/if}

<style>
	.transition-overlay {
		position: absolute;
		top: 40px; /* Start below the top frame border */
		left: 0;
		width: 100%;
		height: calc(100% - 75px); /* Subtract top frame (40px) and bottom toolbar (35px) */
		background: rgba(0, 0, 0, 0.25);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		pointer-events: none;
		overflow: hidden;
	}

	.win-page {
		width: 92%;
		height: 90%;
		background: #ffffff;
		border: 3px solid #000000;
		box-shadow: 0 0 0 2px #ffffff, 8px 8px 0 rgba(0, 0, 0, 0.35);
		transform-origin: center center;
		animation: winOpen 0.36s cubic-bezier(0.2, 0.9, 0.25, 1) forwards;
	}

	/* CRT / old-Windows open: horizontal slit from the middle, then unfold */
	@keyframes winOpen {
		0% {
			transform: scale(0.04, 0.015);
		}
		45% {
			transform: scale(1.02, 0.06);
		}
		100% {
			transform: scale(1, 1);
		}
	}
</style>
