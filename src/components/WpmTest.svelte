<script>
	// The WPM test itself: intro → writing (60s) → review → wall. Used inside
	// the popup (OneMinute.svelte) and on the full page (/wpm).
	//   initial — phase to start on ('intro' | 'wall')
	//   page    — true on /wpm: taller wall grid + a "new one" button on top
	import { onDestroy } from 'svelte';
	import AIText from './AIText.svelte';
	import { configured, loadWall, pinNote, wpmOf } from '$lib/wpm.js';

	export let initial = 'intro';
	export let page = false;

	let phase = initial;   // 'intro' | 'writing' | 'review' | 'wall'
	let text = '';
	let name = '';
	let left = 60;
	let wpm = 0;
	let startedAt = 0;
	let timer = null;
	let notes = [];
	let loading = false;
	let error = '';
	let inputEl;
	let wallSort = 'new'; // 'new' | 'old' | 'long' | 'short' | 'fast' | 'relevance'
	let wallQuery = '';
	$: shown = (() => {
		let list = notes.map((n) => ({ ...n }));
		const q = wallQuery.trim().toLowerCase();
		if (q) {
			const qw = [...new Set(q.split(/\s+/).filter(Boolean))];
			list = list
				.map((n) => {
					const wset = new Set(String(n.text || '').toLowerCase().split(/\W+/).filter(Boolean));
					const hit = qw.filter((w) => wset.has(w)).length;
					return { ...n, sim: qw.length ? Math.round((hit / qw.length) * 100) : 0 };
				})
				.filter((n) => n.sim > 0 || String(n.text || '').toLowerCase().includes(q));
			if (wallSort === 'new' || wallSort === 'old') wallSort = 'relevance';
		}
		const by = {
			new: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
			old: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
			long: (a, b) => String(b.text || '').length - String(a.text || '').length,
			short: (a, b) => String(a.text || '').length - String(b.text || '').length,
			fast: (a, b) => (b.wpm || 0) - (a.wpm || 0),
			relevance: (a, b) => (b.sim || 0) - (a.sim || 0)
		};
		return list.sort(by[wallSort] || by.new);
	})();
	// the fastest three, for the leaderboard strip on the page
	$: top3 = [...notes].filter((n) => n.wpm).sort((a, b) => b.wpm - a.wpm).slice(0, 3);

	export function start() {
		text = ''; left = 60; wpm = 0; startedAt = Date.now(); phase = 'writing';
		setTimeout(() => inputEl && inputEl.focus(), 50);
		timer = setInterval(() => { left -= 1; if (left <= 0) stop(); }, 1000);
	}
	export function stop() {
		if (timer) { clearInterval(timer); timer = null; }
		if (phase === 'writing') { wpm = wpmOf(text, Date.now() - startedAt); phase = 'review'; }
	}
	async function showWall() {
		phase = 'wall'; loading = true; error = '';
		try { notes = await loadWall(); } catch { error = 'Could not load the wall.'; }
		loading = false;
	}
	async function pin() {
		if (!text.trim()) { error = 'Nothing written yet!'; return; }
		error = ''; loading = true;
		try { await pinNote({ text: text.trim(), name: (name || 'anonymous').trim(), wpm }); await showWall(); }
		catch { error = 'Couldn’t pin that — try again?'; loading = false; }
	}
	if (initial === 'wall') showWall();
	onDestroy(() => { if (timer) clearInterval(timer); });
	const tilt = (i) => ((i * 7) % 7) - 3;
</script>

{#if phase === 'intro'}
	<div class="om-body om-intro">
		<p><AIText>a typing test. you have <b>one minute</b> to write anything — a thought, a hello, a confession. we'll count your <b>words per minute</b>, then you pin it to the wall of what visitors chose to say.</AIText></p>
		<div class="om-actions">
			<button class="om-go" on:click={start}>start writing →</button>
			<button class="om-link" on:click={showWall}>see the wall / leaderboard</button>
		</div>
	</div>
{:else if phase === 'writing'}
	<div class="om-body">
		<div class="om-timer" class:low={left <= 10}>{left}s</div>
		<textarea class="om-text" class:tall={page} bind:this={inputEl} bind:value={text} placeholder="write…" spellcheck="false"></textarea>
		<button class="om-link" on:click={stop}>done early</button>
	</div>
{:else if phase === 'review'}
	<div class="om-body">
		<p class="om-up"><AIText>time! <b>{wpm} wpm</b> — pin it to the wall?</AIText></p>
		<div class="om-note-preview">{text || '(you wrote nothing)'}</div>
		<input class="om-name" placeholder="sign it (optional)" bind:value={name} />
		{#if error}<div class="om-err">{error}</div>{/if}
		<div class="om-actions">
			<button class="om-go" on:click={pin} disabled={loading}>{loading ? 'pinning…' : 'pin to wall →'}</button>
			<button class="om-link" on:click={start}>redo</button>
		</div>
	</div>
{:else if phase === 'wall'}
	<div class="om-body" class:page>
		{#if page}
			<div class="om-pagehead">
				<button class="om-go" on:click={start}>⌨ do a new one →</button>
				{#if top3.length}
					<div class="om-top3">
						{#each top3 as n, i}<span class="om-medal"><b>#{i + 1}</b> {n.name || 'anonymous'} · {n.wpm} wpm</span>{/each}
					</div>
				{/if}
			</div>
		{/if}
		{#if !configured}<div class="om-note-local"><AIText>(local wall — notes written in this browser only. A shared wall needs the two Supabase keys, see HOW TO §5d)</AIText></div>{/if}
		{#if notes.length}
			<div class="om-sortbar">
				<input class="om-search" placeholder="search the wall…" bind:value={wallQuery} />
				<div class="om-sorts">
					{#if wallQuery.trim()}<button class:on={wallSort === 'relevance'} on:click={() => (wallSort = 'relevance')}>relevance</button>{/if}
					<button class:on={wallSort === 'new'} on:click={() => (wallSort = 'new')}>new→old</button>
					<button class:on={wallSort === 'old'} on:click={() => (wallSort = 'old')}>old→new</button>
					<button class:on={wallSort === 'long'} on:click={() => (wallSort = 'long')}>long→short</button>
					<button class:on={wallSort === 'short'} on:click={() => (wallSort = 'short')}>short→long</button>
					<button class:on={wallSort === 'fast'} on:click={() => (wallSort = 'fast')}>fastest wpm</button>
				</div>
			</div>
		{/if}
		{#if loading}
			<p class="om-up">loading the wall…</p>
		{:else if error}
			<div class="om-err">{error}</div>
		{:else if notes.length === 0}
			<p class="om-up"><AIText>no notes yet — be the first.</AIText></p>
		{:else if shown.length === 0}
			<p class="om-up" data-no-reveal><AIText>no notes match “{wallQuery}”.</AIText></p>
		{:else}
			<div class="om-wall" class:page>
				{#each shown as n, i}
					<div class="om-note" style="transform: rotate({tilt(i)}deg)">
						{#if wallQuery.trim() && n.sim !== undefined}<div class="om-sim">{n.sim}% match</div>{/if}
						<div class="om-note-text">{n.text}</div>
						<div class="om-note-sig">— {n.name || 'anonymous'}{#if n.wpm}<span class="om-wpm"> · {n.wpm} wpm</span>{/if}</div>
					</div>
				{/each}
			</div>
		{/if}
		{#if !page}<button class="om-go om-write-own" on:click={() => (phase = 'intro')}>write your own →</button>{/if}
	</div>
{/if}

<style>
	.om-body { padding: 12px; }
	.om-intro p { font-size: 0.9rem; line-height: 1.5; margin: 0 0 12px; }
	.om-actions { display: flex; align-items: center; gap: 12px; }
	.om-go { background: #000; color: #fff; border: none; padding: 8px 16px; font: inherit; font-weight: 700; cursor: pointer; }
	.om-go:disabled { opacity: 0.6; }
	.om-link { background: none; border: none; text-decoration: underline; cursor: pointer; font: inherit; font-size: 0.8rem; color: #333; }
	.om-timer { font-size: 1.6rem; font-weight: 700; text-align: right; }
	.om-timer.low { color: #d83b3b; }
	.om-text { width: 100%; box-sizing: border-box; border: 1px solid #000; background: #fff; padding: 10px; font: inherit; font-size: 0.95rem; min-height: 120px; resize: vertical; margin: 6px 0; }
	.om-up { font-size: 0.9rem; margin: 0 0 10px; }
	.om-note-preview { padding: 12px; border: 1px solid rgba(0,0,0,0.25); font-size: 0.9rem; white-space: pre-wrap; margin-bottom: 10px; min-height: 48px; }
	.om-name { width: 100%; box-sizing: border-box; border: 1px solid #000; background: #f7f7f7; padding: 6px 8px; font: inherit; font-size: 0.82rem; margin-bottom: 10px; }
	.om-err { color: #b00020; font-size: 0.78rem; margin-bottom: 8px; }
	.om-note-local { font-size: 0.7rem; color: #555; margin-bottom: 8px; }
	.om-sortbar { margin-bottom: 10px; }
	.om-search { width: 100%; box-sizing: border-box; border: 1px solid #000; background: #f7f7f7; padding: 6px 8px; font: inherit; font-size: 0.8rem; margin-bottom: 6px; }
	.om-sorts { display: flex; flex-wrap: wrap; gap: 4px; }
	.om-sorts button { background: #c0c0c0; border: 1px solid #000; font: inherit; font-size: 0.7rem; padding: 2px 7px; cursor: pointer; }
	.om-sorts button.on { background: #000; color: #fff; }
	.om-sim { font-size: 0.62rem; color: #333; margin-bottom: 4px; font-weight: 700; }
	.om-wall { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px; max-height: 50vh; overflow: auto; padding: 6px; }
	.om-note { padding: 10px; border: 1px solid rgba(0,0,0,0.2); box-shadow: 1px 2px 3px rgba(0,0,0,0.25); font-size: 0.8rem; }
	.om-note-text { white-space: pre-wrap; word-break: break-word; }
	.om-note-sig { margin-top: 8px; font-size: 0.7rem; color: #444; text-align: right; }
	.om-wpm { font-weight: 700; color: #000; }
	.om-write-own { margin-top: 12px; }

	.om-text.tall { min-height: 240px; font-size: 1.05rem; }
	.om-wall.page { max-height: none; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
	.om-pagehead { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-bottom: 14px; }
	.om-top3 { display: flex; flex-wrap: wrap; gap: 10px; font-size: 0.8rem; }
	.om-medal { border: 1px solid #000; background: #fff; padding: 3px 8px; }
	.om-note { background: #fff; }
</style>
