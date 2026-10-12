<script>
	// "Write for one minute on www.rhea.com" — pops up like a retro ad. You get
	// 60 seconds to write anything, then pin it to a shared sticky-note WALL of
	// what visitors chose to say.
	//
	// THE WALL IS SHARED, so it needs a tiny backend (this site is static).
	// Easiest: a free Supabase table. Fill the two constants below and it's a
	// real shared wall; leave them empty and it falls back to a local wall
	// (only notes written in THIS browser). Setup steps in HOW TO §5d.
	//   table `notes`:  id (uuid, default), text (text), name (text), created_at (timestamptz, default now())
	//   RLS: allow anon INSERT + SELECT (insert-only — visitors can't edit/delete others').
	const SUPABASE_URL = '';       // e.g. 'https://abcd.supabase.co'
	const SUPABASE_ANON_KEY = '';  // the public anon key
	const configured = SUPABASE_URL && SUPABASE_ANON_KEY;

	import { onMount } from 'svelte';

	let open = false;
	let dismissed = false;
	let phase = 'intro';   // 'intro' | 'writing' | 'review' | 'wall'
	let text = '';
	let name = '';
	let left = 60;
	let timer = null;
	let notes = [];
	let loading = false;
	let error = '';
	let inputEl;
	// Wall sorting / searching
	let wallSort = 'new'; // 'new' | 'old' | 'long' | 'short' | 'relevance'
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
			relevance: (a, b) => (b.sim || 0) - (a.sim || 0)
		};
		return list.sort(by[wallSort] || by.new);
	})();

	const COLORS = ['#fff7a8', '#ffd6e0', '#c9f0d2', '#cfe3ff', '#ffe6c2', '#e8d6ff'];

	onMount(() => {
		try {
			dismissed = localStorage.getItem('omDismissed') === '1';
			if (!dismissed && !sessionStorage.getItem('omShown')) {
				sessionStorage.setItem('omShown', '1');
				setTimeout(() => (open = true), 1400);
			}
		} catch {}
	});

	function openIt() { open = true; phase = 'intro'; }
	function dismiss() { open = false; dismissed = true; stop(); try { localStorage.setItem('omDismissed', '1'); } catch {} }

	function start() {
		text = ''; left = 60; phase = 'writing';
		setTimeout(() => inputEl && inputEl.focus(), 50);
		timer = setInterval(() => {
			left -= 1;
			if (left <= 0) stop();
		}, 1000);
	}
	function stop() {
		if (timer) { clearInterval(timer); timer = null; }
		if (phase === 'writing') phase = 'review';
	}

	async function loadWall() {
		phase = 'wall'; loading = true; error = '';
		try {
			if (configured) {
				const res = await fetch(`${SUPABASE_URL}/rest/v1/notes?select=*&order=created_at.desc&limit=120`, {
					headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
				});
				notes = res.ok ? await res.json() : [];
			} else {
				notes = JSON.parse(localStorage.getItem('omLocalWall') || '[]');
			}
		} catch (e) { error = 'Could not load the wall.'; }
		loading = false;
	}

	async function pin() {
		if (!text.trim()) { error = 'Nothing written yet!'; return; }
		error = ''; loading = true;
		const note = { text: text.trim(), name: (name || 'anonymous').trim() };
		try {
			if (configured) {
				const res = await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
					method: 'POST',
					headers: {
						apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
						'Content-Type': 'application/json', Prefer: 'return=minimal'
					},
					body: JSON.stringify(note)
				});
				if (!res.ok) throw new Error();
			} else {
				const local = JSON.parse(localStorage.getItem('omLocalWall') || '[]');
				local.unshift({ ...note, created_at: new Date().toISOString() });
				localStorage.setItem('omLocalWall', JSON.stringify(local.slice(0, 120)));
			}
			await loadWall();
		} catch (e) { error = 'Couldn’t pin that — try again?'; loading = false; }
	}

	function color(i) { return COLORS[i % COLORS.length]; }
	function tilt(i) { return ((i * 7) % 7) - 3; }
</script>

{#if !dismissed && !open}
	<button class="om-fab" on:click={openIt} title="Write for one minute">✎ one minute</button>
{/if}

{#if open}
	<div class="om-ad" class:wide={phase === 'wall'}>
		<div class="om-bar">
			<span>✎ one minute on www.rhea.com</span>
			<button class="om-x" on:click={dismiss} aria-label="Close">×</button>
		</div>

		{#if phase === 'intro'}
			<div class="om-body om-intro">
				<p>you have <b>one minute</b> to write anything — a thought, a hello, a confession. then pin it to the wall of what visitors chose to say.</p>
				<div class="om-actions">
					<button class="om-go" on:click={start}>start writing →</button>
					<button class="om-link" on:click={loadWall}>see the wall</button>
				</div>
			</div>
		{:else if phase === 'writing'}
			<div class="om-body">
				<div class="om-timer" class:low={left <= 10}>{left}s</div>
				<textarea class="om-text" bind:this={inputEl} bind:value={text} placeholder="write…" spellcheck="false"></textarea>
				<button class="om-link" on:click={stop}>done early</button>
			</div>
		{:else if phase === 'review'}
			<div class="om-body">
				<p class="om-up">time! pin it to the wall?</p>
				<div class="om-note-preview" style="background: {color(0)}">{text || '(you wrote nothing)'}</div>
				<input class="om-name" placeholder="sign it (optional)" bind:value={name} />
				{#if error}<div class="om-err">{error}</div>{/if}
				<div class="om-actions">
					<button class="om-go" on:click={pin} disabled={loading}>{loading ? 'pinning…' : 'pin to wall →'}</button>
					<button class="om-link" on:click={start}>redo</button>
				</div>
			</div>
		{:else if phase === 'wall'}
			<div class="om-body">
				{#if !configured}<div class="om-note-local">(local wall — a shared one needs Supabase, see HOW TO §5d)</div>{/if}
				{#if notes.length}
					<div class="om-sortbar">
						<input class="om-search" placeholder="search the wall…" bind:value={wallQuery} />
						<div class="om-sorts">
							{#if wallQuery.trim()}<button class:on={wallSort === 'relevance'} on:click={() => (wallSort = 'relevance')}>relevance</button>{/if}
							<button class:on={wallSort === 'new'} on:click={() => (wallSort = 'new')}>new→old</button>
							<button class:on={wallSort === 'old'} on:click={() => (wallSort = 'old')}>old→new</button>
							<button class:on={wallSort === 'long'} on:click={() => (wallSort = 'long')}>long→short</button>
							<button class:on={wallSort === 'short'} on:click={() => (wallSort = 'short')}>short→long</button>
						</div>
					</div>
				{/if}
				{#if loading}
					<p class="om-up">loading the wall…</p>
				{:else if error}
					<div class="om-err">{error}</div>
				{:else if notes.length === 0}
					<p class="om-up">no notes yet — be the first.</p>
				{:else if shown.length === 0}
					<p class="om-up">no notes match “{wallQuery}”.</p>
				{:else}
					<div class="om-wall">
						{#each shown as n, i}
							<div class="om-note" style="background: {color(i)}; transform: rotate({tilt(i)}deg)">
								{#if wallQuery.trim() && n.sim !== undefined}<div class="om-sim">{n.sim}% match</div>{/if}
								<div class="om-note-text">{n.text}</div>
								<div class="om-note-sig">— {n.name || 'anonymous'}</div>
							</div>
						{/each}
					</div>
				{/if}
				<button class="om-go om-write-own" on:click={() => (phase = 'intro')}>write your own →</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.om-fab {
		position: fixed; left: 14px; bottom: 44px; z-index: 9400;
		background: #c0c0c0; color: #000;
		border: 2px solid #000; border-color: #fff #808080 #808080 #fff;
		padding: 7px 11px; font: inherit; font-size: 0.78rem; cursor: pointer;
		box-shadow: 2px 2px 0 rgba(0,0,0,0.35);
	}
	.om-fab:hover { background: #cfcfcf; }
	.om-ad {
		position: fixed; left: 14px; bottom: 44px; z-index: 9400;
		width: min(380px, 92vw);
		background: #c0c0c0; border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0,0,0,0.45);
		font-family: var(--font-family, monospace);
		animation: omPop 0.18s ease-out;
	}
	.om-ad.wide { width: min(560px, 94vw); }
	@keyframes omPop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
	.om-bar {
		display: flex; align-items: center; justify-content: space-between;
		padding: 6px 10px; background: #000080; color: #fff; font-size: 0.8rem; font-weight: 700;
	}
	.om-x { background: none; border: none; color: #fff; font-size: 1.1rem; line-height: 1; cursor: pointer; }
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
	.om-write-own { margin-top: 12px; }
	@media (max-width: 600px) { .om-fab, .om-ad { left: 8px; bottom: 40px; } }
</style>
