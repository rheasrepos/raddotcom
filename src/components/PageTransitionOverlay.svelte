<script>
	import { pageTransition, transitionActions } from '../lib/pageTransition.js';
	import LoadingCircle from './LoadingCircle.svelte';
	import { page } from '$app/stores';
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
			<div class="transition-content">
				<LoadingCircle size="40px" color="#333333" />
			</div>
		</div>
	{/if}

<style>
	.transition-overlay {
		position: absolute;
		top: 40px; /* Start below the top frame border */
		left: 0;
		width: 100%;
		height: calc(100% - 75px); /* Subtract top frame (40px) and bottom toolbar (35px) */
		background: rgba(255, 140, 66, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		opacity: 0;
		transition: opacity 0.2s ease;
		pointer-events: none;
		backdrop-filter: blur(2px);
	}

	.transition-overlay.visible {
		opacity: 1;
	}

	.transition-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
		text-align: center;
	}


</style> 