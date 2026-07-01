<script>
	// Marks text that was drafted with AI. Renders a dashed underline and a
	// small hover/focus popup explaining it. Wrap any inline text:
	//   <AIText>some copy</AIText>
	//   <AIText note="Custom explanation.">some copy</AIText>
	export let note = 'This text was drafted with AI assistance.';
</script>

<span class="ai-text" tabindex="0" role="note" aria-label={note}>
	<slot />
	<span class="ai-pop">{note}</span>
</span>

<style>
	.ai-text {
		position: relative;
		text-decoration: underline dashed;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		cursor: help;
	}

	.ai-pop {
		position: absolute;
		left: 0;
		bottom: calc(100% + 8px);
		width: max-content;
		max-width: 260px;
		background: #111;
		color: #fff;
		border: 1px solid #000;
		padding: 8px 10px;
		font-size: 0.78rem;
		line-height: 1.4;
		font-style: normal;
		text-decoration: none;
		text-align: left;
		opacity: 0;
		visibility: hidden;
		transform: translateY(3px);
		transition: opacity 0.14s ease, transform 0.14s ease;
		z-index: 60;
		pointer-events: none;
	}

	/* Little pointer arrow */
	.ai-pop::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 14px;
		border: 6px solid transparent;
		border-top-color: #111;
	}

	.ai-text:hover .ai-pop,
	.ai-text:focus .ai-pop,
	.ai-text:focus-visible .ai-pop {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}
</style>
