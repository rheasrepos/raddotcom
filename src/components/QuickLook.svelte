<script>
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	/**
	 * A Mac-style "Quick Look" overlay.
	 * Shows a preview of a desktop item above the desktop.
	 *  - kind 'file'   -> preview a post (title, meta, excerpt) + Open action
	 *  - kind 'folder' -> a window listing the folder's items
	 *  - kind 'link'   -> a simple card (About / Résumé) + Open action
	 */
	export let item = null;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}
	function open(target) {
		dispatch('open', target ?? item);
	}

	// Strip HTML to a plain-text excerpt for previews.
	function excerpt(html, max = 480) {
		if (!html) return '';
		const text = String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
		return text.length > max ? text.slice(0, max) + '…' : text;
	}
</script>

{#if item}
	<div
		class="ql-backdrop"
		role="presentation"
		on:click|self={close}
		transition:fade={{ duration: 120 }}
	>
		<div class="ql-window {item.kind}" out:scale={{ duration: 140, start: 0.96 }}>
			<header class="ql-titlebar">
				<div class="ql-traffic">
					<button class="dot red" title="Close" on:click={close} aria-label="Close"></button>
					<span class="dot yellow"></span>
					<span class="dot green"></span>
				</div>
				<span class="ql-title">{item.label || item.title}</span>
				<span class="ql-spacer"></span>
			</header>

			{#if item.kind === 'folder'}
				<div class="ql-folder-body">
					{#if item.items && item.items.length}
						<ul class="ql-list">
							{#each item.items as p}
								<li>
									<button class="ql-row" on:click={() => open({ kind: 'file', ...p })}>
										<span class="ql-row-text">
											<span class="ql-row-title">{p.title}</span>
											<span class="ql-row-meta">{p.date || ''}{p.type ? ' · ' + p.type : ''}</span>
										</span>
										<span class="ql-row-arrow">→</span>
									</button>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="ql-empty">This folder is empty.</p>
					{/if}
				</div>
			{:else if item.kind === 'file'}
				<div class="ql-file-body">
					<div class="ql-meta">{item.date || ''}{item.type ? ' · ' + item.type : ''}</div>
					{#if item.description}
						<p class="ql-desc">{item.description}</p>
					{/if}
					<p class="ql-excerpt">{excerpt(item.content)}</p>
					<button class="ql-open" on:click={() => open()}>Open full post →</button>
				</div>
			{:else}
				<div class="ql-file-body">
					{#if item.description}<p class="ql-desc">{item.description}</p>{/if}
					<button class="ql-open" on:click={() => open()}>Open →</button>
				</div>
			{/if}

			<footer class="ql-hint">Press <kbd>space</kbd> or <kbd>esc</kbd> to close</footer>
		</div>
	</div>
{/if}

<style>
	.ql-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(20, 20, 30, 0.45);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 24px;
	}
	.ql-window {
		background: #fbfbfd;
		border: 1px solid #000;
		width: min(560px, 92vw);
		max-height: 84vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: var(--font-family, Arial, sans-serif);
		/* Old-Windows open: the window bursts open from the middle */
		transform-origin: center center;
		animation: qlWinOpen 0.32s cubic-bezier(0.2, 0.9, 0.25, 1);
	}
	@keyframes qlWinOpen {
		0% { transform: scale(0.04, 0.015); }
		45% { transform: scale(1.02, 0.06); }
		100% { transform: scale(1, 1); }
	}
	.ql-window.folder { width: min(640px, 94vw); }
	.ql-titlebar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 12px;
		background: linear-gradient(#ededf0, #dedee3);
		border-bottom: 1px solid #000;
	}
	.ql-traffic { display: flex; gap: 6px; }
	.dot {
		width: 12px; height: 12px; 
		border: 1px solid rgba(0,0,0,0.35); padding: 0; cursor: pointer;
	}
	.dot.red { background: #ff5f57; }
	.dot.yellow { background: #febc2e; }
	.dot.green { background: #28c840; }
	.ql-title { font-weight: 700; font-size: 0.95rem; }
	.ql-spacer { flex: 1; }
	.ql-file-body { padding: 22px 24px; overflow: auto; }
	.ql-meta { font-size: 0.8rem; color: #666; margin-bottom: 10px; }
	.ql-desc { font-size: 1rem; font-style: italic; margin: 0 0 12px; color: #333; }
	.ql-excerpt { font-size: 1rem; line-height: 1.6; color: #111; white-space: pre-wrap; }
	.ql-open {
		margin-top: 18px;
		background: #000; color: #fff; border: none;
		padding: 10px 16px; font-weight: 700; font-size: 0.9rem;
		
	}
	.ql-folder-body { padding: 10px; overflow: auto; }
	.ql-list { list-style: none; margin: 0; padding: 0; }
	.ql-row {
		width: 100%; display: flex; align-items: center; gap: 12px;
		padding: 10px 12px; background: transparent; border: none;
		text-align: left; 
	}
	.ql-row:hover { background: #e8f0fe; }
	.ql-row-doc { font-size: 1.4rem; }
	.ql-row-text { display: flex; flex-direction: column; flex: 1; }
	.ql-row-title { font-weight: 600; font-size: 0.95rem; }
	.ql-row-meta { font-size: 0.78rem; color: #777; }
	.ql-row-arrow { color: #999; }
	.ql-empty { padding: 24px; color: #777; }
	.ql-hint { padding: 8px 14px; border-top: 1px solid #e3e3e8; font-size: 0.72rem; color: #999; text-align: right; }
	kbd {
		background: #eee; border: 1px solid #ccc; border-bottom-width: 2px;
	}
</style>
