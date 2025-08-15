<script>
	export let size = '40px';
	export let color = 'var(--color-accent)';
	export let thickness = '3px';
</script>

<div class="loading-circle" style="width: {size}; height: {size};">
	<svg 
		class="spinner" 
		viewBox="0 0 50 50"
		style="width: {size}; height: {size};"
	>
		<circle
			class="spinner-circle"
			cx="25"
			cy="25"
			r="20"
			fill="none"
			stroke-width="{thickness}"
			style="stroke: {color};"
		></circle>
	</svg>
</div>

<style>
	.loading-circle {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.spinner {
		animation: rotate 1s linear infinite;
	}

	.spinner-circle {
		stroke-linecap: round;
		animation: dash 1.5s ease-in-out infinite;
	}

	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes dash {
		0% {
			stroke-dasharray: 1, 150;
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -35;
		}
		100% {
			stroke-dasharray: 90, 150;
			stroke-dashoffset: -124;
		}
	}
</style> 