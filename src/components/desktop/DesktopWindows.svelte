<script>
	// All open Finder-style windows (folders + file previews) and the dock of
	// minimized ones. The window LIST lives in the page (`bind:windows`); the
	// operations that change it are in $lib/desktop/windows.js.
	// Emits `viewimage` ({src, alt}) when an image inside a window is clicked.
	import { createEventDispatcher } from 'svelte';
	import FinderWindow from '../FinderWindow.svelte';
	import PostPreview from '../PostPreview.svelte';
	import { redactionClass } from '$lib/redaction.js';
	import { formatDate } from '$lib/posts.js';
	import { getCategoryLabel } from '$lib/categories.js';
	import { folderContents, prettyFolder, ytId, renderMarkdownSafe } from '$lib/desktop/content.js';
	import { openFile, focusWindow, closeWindow, minimizeWindow, navInto, navBack, windowTitle } from '$lib/desktop/windows.js';

	export let windows = [];
	export let projects = [];
	const dispatch = createEventDispatcher();
	const viewImage = (src, alt) => dispatch('viewimage', { src, alt });
</script>

<!-- Draggable / resizable Finder windows -->
{#each windows as win (win.id)}
	{#if !win.minimized}
		<FinderWindow
			title={windowTitle(win)}
			bind:x={win.x} bind:y={win.y} bind:w={win.w} bind:h={win.h} z={win.z}
			canBack={win.kind === 'folder'}
			on:focus={() => (windows = focusWindow(windows, win.id))}
			on:close={() => (windows = closeWindow(windows, win.id))}
			on:minimize={() => (windows = minimizeWindow(windows, win.id))}
			on:back={() => (windows = navBack(windows, win))}
		>
			{#if win.kind === 'folder'}
				{@const c = folderContents(win, projects)}
				{@const cur = win.stack[win.stack.length - 1]}
				{@const total = c.childCats.length + c.subs.length + c.posts.length}
				{#if total === 0}
					<p class="win-empty">Empty.</p>
				{:else}
					<!-- Icon-view grid: uniform paper-sized tiles that wrap. -->
					<div class="win-fill">
						{#each c.childCats as child}
							<button class="win-cell folder" on:click={() => (windows = navInto(windows, win, child.id, null, child.label))}>
								<svg viewBox="0 0 56 46" class="cell-folder"><path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999" stroke-width="1.2"/><rect x="0" y="11" width="56" height="35" fill="#e8e8e8" stroke="#999" stroke-width="1.2"/></svg>
								<span class="cell-cap">{child.label}</span>
							</button>
						{/each}
						{#each c.subs as sub}
							<button class="win-cell folder" on:click={() => (windows = navInto(windows, win, cur.category, sub, prettyFolder(sub)))}>
								<svg viewBox="0 0 56 46" class="cell-folder"><path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999" stroke-width="1.2"/><rect x="0" y="11" width="56" height="35" fill="#e8e8e8" stroke="#999" stroke-width="1.2"/></svg>
								<span class="cell-cap">{prettyFolder(sub)}</span>
							</button>
						{/each}
						{#each c.posts as p (p.id)}
							<button class="win-cell" class:art={p.type === 'art'} on:click={() => (windows = openFile(windows, p))}>
								<div class="cell-media"><PostPreview post={p} /></div>
								<span class="cell-cap {redactionClass(p.date)}">{p.title}</span>
							</button>
						{/each}
					</div>
				{/if}
			{:else if win.kind === 'file'}
				{@const p = win.post}
				<div class="win-file" class:media={p.image || (p.images && p.images.length) || p.pdf || p.video || p.youtubePlaylist}>
					<div class="win-file-meta">{formatDate(p.date)} · {getCategoryLabel(p.type)}</div>
					{#if p.images && p.images.length > 1}
						<div class="win-gallery">
							{#each p.images as img, i}
								<img class="win-gimg" src={img} alt="{p.title} — {i + 1} of {p.images.length}" loading="lazy" style="cursor: zoom-in;" on:click={() => viewImage(img, p.title)} />
							{/each}
						</div>
					{:else if p.image}
						<div class="win-imgwrap"><img class="win-image" src={p.image} alt={p.title} loading="lazy" style="cursor: zoom-in;" on:click={() => viewImage(p.image, p.title)} /></div>
					{:else if p.youtubePlaylist}
						<div class="win-embed"><iframe src="https://www.youtube.com/embed/videoseries?list={p.youtubePlaylist}" title={p.title} allowfullscreen></iframe></div>
					{:else if p.video && ytId(p.video)}
						<div class="win-embed"><iframe src="https://www.youtube.com/embed/{ytId(p.video)}" title={p.title} allowfullscreen></iframe></div>
					{:else if p.pdf}
						<iframe class="win-pdf" src={p.pdf} title={p.title}></iframe>
					{:else if p.link}
						<!-- Live view of the project site (same as blog / post page) -->
						<div class="win-embed"><iframe src={p.link} title={p.title}></iframe></div>
					{:else}
						<div class="win-prose {redactionClass(p.date)}">{@html renderMarkdownSafe(p.content)}</div>
					{/if}
					{#if p.link}
						<a class="win-open" href={p.link} target="_blank" rel="noopener noreferrer">Open ↗</a>
					{/if}
					<a class="win-open" href="/posts/{p.id}">Open full post →</a>
				</div>
			{/if}
		</FinderWindow>
	{/if}
{/each}

<!-- Minimized windows dock as tabs along the bottom (like Gmail drafts) -->
{#if windows.some((w) => w.minimized)}
	<div class="win-dock">
		{#each windows.filter((w) => w.minimized) as win (win.id)}
			<div class="dock-tab">
				<button class="dock-title" on:click={() => (windows = focusWindow(windows, win.id))}>
					{win.kind === 'folder' ? win.stack[win.stack.length - 1].title : win.post.title}
				</button>
				<button class="dock-close" on:click={() => (windows = closeWindow(windows, win.id))} title="Close" aria-label="Close">×</button>
			</div>
		{/each}
	</div>
{/if}

<style>
	/* One fill-the-window grid: rows share the height equally, so fewer items
	   are bigger and a single folder/file fills the whole window. */
	.win-fill {
		display: grid;
		/* Mac icon-view: uniform, paper-ish tiles that wrap, no stretching. */
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 20px 16px;
		grid-auto-rows: min-content;
		align-content: start;
		justify-items: center;
	}
	.win-cell {
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		font: inherit;
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 130px;
		align-self: start;
	}
	/* The cover is a downscaled 8.5×11 sheet (portrait), like a document icon */
	.win-cell .cell-media {
		width: 108px;
		height: 140px;
		border: 1px solid #000;
		background: #fff;
		overflow: hidden;
		display: flex;
	}
	/* Art tiles: no paper frame — just the artwork itself, like a folder icon */
	.win-cell.art .cell-media {
		width: 118px;
		height: auto;
		max-height: 150px;
		border: none;
		background: transparent;
	}
	.win-cell.art .cell-media :global(.pv) { background: transparent; }
	.win-cell.art .cell-media :global(.pv-thumb) { background: transparent; }
	.win-cell:hover .cell-media { outline: 2px solid #000; }
	/* Folder cells: just the folder icon + name (icon-view style) */
	.win-cell.folder {
		background: transparent;
		border: none;
		gap: 6px;
		padding: 0;
	}
	.win-cell.folder:hover .cell-media { outline: none; }
	.win-cell.folder:hover { background: rgba(0, 0, 0, 0.06); }
	.cell-folder { width: 84px; height: auto; }
	/* Caption: a plain label under the icon, no box/border */
	.cell-cap {
		flex: none;
		padding: 6px 2px 0;
		font-size: 0.78rem;
		line-height: 1.2;
		text-align: center;
		word-break: break-word;
		max-width: 130px;
	}
	.win-empty { color: #999; font-size: 0.85rem; }
	.win-file-meta { font-size: 0.75rem; color: #777; margin-bottom: 10px; }
	.win-embed { position: relative; padding-top: 56.25%; }
	.win-embed iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 1px solid #000; }
	.win-pdf { width: 100%; height: 60vh; border: 1px solid #000; }
	/* The file window is a flex column filling its window; the image scales
	   to fit (contain) so the WHOLE artifact is always visible, at any window
	   size — resize the window and the image just scales with it. */
	.win-file { display: flex; flex-direction: column; height: 100%; min-height: 0; }
	/* Media (image/pdf/video) fills the window edge-to-edge: pull out the
	   window body padding and shrink the chrome so the content dominates. */
	.win-file.media {
		margin: -14px;
		height: calc(100% + 28px);
	}
	.win-file.media .win-file-meta { padding: 8px 12px 6px; margin: 0; }
	.win-file.media .win-open { margin: 0; border: none; border-top: 1px solid #000; }
	.win-file.media .win-image { border: none; }
	/* Multi-page/side artifact: a scrollable stack of all its images */
	.win-gallery { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 10px; }
	.win-gimg { max-width: 100%; border: 1px solid #000; display: block; }
	/* Image wrapper fills remaining height; image fits inside (contain) so the
	   whole scan shows and scales as the window resizes. */
	.win-imgwrap {
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.win-image {
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		object-fit: contain;
		border: 1px solid #000;
		display: block;
	}
	.win-open {
		display: inline-block;
		margin-top: 12px;
		border: 1px solid #000;
		padding: 5px 12px;
		text-decoration: none;
		color: #000;
	}
	.win-open:hover { background: #000; color: #fff; }
	.win-prose { font-size: 0.9rem; line-height: 1.5; }
	.win-prose :global(p) { margin: 0 0 0.7em; }

	/* Minimized windows dock as tabs at the bottom, like Gmail drafts */
	.win-dock {
		position: fixed;
		bottom: 40px;
		right: 16px;
		display: flex;
		gap: 8px;
		z-index: 400;
	}
	.dock-tab {
		display: flex;
		align-items: center;
		background: #c0c0c0;
		border: 2px solid #000;
		box-shadow: 2px 2px 0 rgba(0,0,0,0.35);
		max-width: 220px;
	}
	.dock-title {
		background: none;
		border: none;
		padding: 6px 10px;
		font-size: 0.78rem;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.dock-close {
		background: none;
		border: none;
		border-left: 1px solid #000;
		padding: 6px 9px;
		cursor: pointer;
		font-size: 0.9rem;
	}
	.dock-close:hover { background: #ff5f57; }
</style>
