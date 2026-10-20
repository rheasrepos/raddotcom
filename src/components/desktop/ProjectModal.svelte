<script>
	// The grey file dialog that opens when you click a loose file / search hit
	// on the desktop. Sits inside .laptop-screen (absolute, under the topbar,
	// above the wallpaper toolbar). Emits `close` and `viewimage` (src, alt).
	import { createEventDispatcher } from 'svelte';
	import { redactionClass } from '$lib/redaction.js';
	export let project;
	const dispatch = createEventDispatcher();
	const close = () => dispatch('close');
	const viewImage = (src, alt) => dispatch('viewimage', { src, alt });
</script>

<div class="modal-overlay" on:click={close}>
	<div class="modal-content" on:click|stopPropagation>
		<button class="close-btn" on:click={close}>×</button>
		<div class="modal-body">
			{#if project.image}
				<img
					src={project.image}
					alt={project.title}
					title="Click to view full size"
					style="cursor: zoom-in;"
					on:click={() => viewImage(project.image, project.title)}
				/>
			{/if}
			<h2 class="{redactionClass(project.date)}" class:ai-title={project.aiTitle} title={project.aiTitle ? 'Title drafted with AI assistance' : undefined}>{project.title}</h2>
			<p class="project-date">{new Date(project.date).toLocaleDateString()}</p>
			<p class="project-description {redactionClass(project.date)}" class:ai-desc={project.aiDescription} title={project.aiDescription ? 'Description drafted with AI assistance' : undefined}>{project.description}</p>
			{#if project.pdf}
				<!-- Original document beats mangled text every time -->
				<iframe src={project.pdf} title="{project.title} (PDF)" class="modal-pdf"></iframe>
			{:else}
				<div class="project-content {redactionClass(project.date)}">
					{@html project.content}
				</div>
			{/if}
			<div class="project-actions">
				{#if project.link}
					<a href={project.link} target="_blank" rel="noopener noreferrer" class="view-post-btn">Open project ↗</a>
				{/if}
				<a href="/posts/{project.id}" class="view-post-btn">View Full Post →</a>
			</div>
		</div>
	</div>
</div>

<style>
	.modal-pdf {
		display: block;
		width: 100%;
		height: 60vh;
		border: 2px solid #000;
		background: #fff;
	}

	/* File previews fade in quietly. (The old-Windows slit animation is kept
	   for folders only, in QuickLook.) */
	:global(.modal-content) {
		animation: modalFade 0.14s ease-out;
	}
	@keyframes modalFade {
		from { opacity: 0; transform: scale(0.98); }
		to { opacity: 1; transform: scale(1); }
	}

	/* AI-generated titles get a dashed underline (same convention as AIText) */
	.ai-title {
		text-decoration: underline dashed;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		cursor: help;
	}

	.view-post-btn {
		display: inline-block;
		padding: 8px 16px;
		background: #000000;
		color: #ffffff;
		text-decoration: none;
		border: 1px solid #000000;
		transition: all 0.2s ease;
	}

	.view-post-btn:hover {
		background: #ffffff;
		color: #000000;
	}

	.project-actions {
		margin-top: 15px;
		text-align: center;
	}

	.view-post-btn {
		display: inline-block;
		background: #000000;
		color: #ffffff;
		text-decoration: none;
		padding: 0.75rem 1.5rem;
		font-family: Arial, sans-serif;
		font-size: 1rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.view-post-btn:hover {
		opacity: 0.8;
	}

	/* Modal Styles */
	.modal-overlay {
		position: absolute;
		top: 50px; /* Below the topbar */
		left: 0;
		right: 0;
		bottom: 35px; /* Above the wallpaper toolbar */
		background: rgba(0, 0, 0, 0.4);
		z-index: 500;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-content {
		background: #c0c0c0;
		width: 90%;
		max-width: 760px;
		max-height: 88vh;
		overflow-y: auto;
		position: relative;
		border: 2px solid #000000;
	}

	.close-btn {
		position: absolute;
		top: 15px;
		right: 20px;
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: #636e72;
		z-index: 1;
	}

	.close-btn:hover {
		color: #ff6b6b;
	}

	.modal-body {
		padding: 30px;
	}

	.modal-body img {
		display: block;
		max-width: 100%;
		max-height: 60vh;
		width: auto;
		height: auto;
		object-fit: contain;
		margin: 0 auto 20px;
		background: #f2f2f2;
	}

	.modal-body h2 {
		font-size: 1.8rem;
		margin-bottom: 10px;
		color: #2d3436;
	}

	.project-date {
		color: #636e72;
		font-size: 0.9rem;
		margin-bottom: 15px;
	}

	.project-description {
		font-size: 1rem;
		color: #2d3436;
		margin-bottom: 20px;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3; /* Show 3 lines */
		overflow: hidden;
		text-overflow: ellipsis;
		max-height: calc(1.5em * 3); /* line-height * 3 lines */
	}

	.project-content {
		line-height: 1.8;
		color: #2d3436;
	}
</style>
