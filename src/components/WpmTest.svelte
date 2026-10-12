<script>
	// "Create your own WPM on rad dot com" — a typing-speed test that pops up
	// like a retro web ad. Measures WPM + accuracy on a short passage and keeps
	// your personal best (localStorage). A GLOBAL leaderboard needs a backend
	// (see HOW TO §5d) — until then it's a personal best + this session's runs.
	import { onMount } from 'svelte';

	// Passages to type — a few of Rhea's own lines + web-nostalgia bits.
	const PASSAGES = [
		'a personal public archive — modeled after a desktop, a place i spend a lot of time as a physical and digital hoarder.',
		'the font is called redaction and it degrades into pixels the older the content you are viewing is.',
		'i see this website as an archive of my digital life and my official internet presence.',
		'welcome to my desktop. double-click a folder, press space to preview a file, and drag the obsidian graph around.',
		'how this website is organized is still a work in progress. all of it is a work in progress.'
	];

	let open = false;
	let dismissed = false;
	let passage = '';
	let typed = '';
	let startAt = null;
	let finished = false;
	let wpm = 0;
	let acc = 100;
	let best = 0;
	let runs = []; // this session's attempts
	let inputEl;

	onMount(() => {
		try {
			best = Number(localStorage.getItem('wpmBest') || 0);
			dismissed = localStorage.getItem('wpmDismissed') === '1';
			// pop once per session, like an ad
			if (!dismissed && !sessionStorage.getItem('wpmShown')) {
				sessionStorage.setItem('wpmShown', '1');
				setTimeout(() => reset(true), 1200);
			}
		} catch {}
	});

	function reset(show = false) {
		passage = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
		typed = '';
		startAt = null;
		finished = false;
		wpm = 0;
		acc = 100;
		if (show) open = true;
		setTimeout(() => inputEl && inputEl.focus(), 50);
	}
	function openTest() { if (!passage) reset(); open = true; setTimeout(() => inputEl && inputEl.focus(), 50); }
	function dismiss() { open = false; dismissed = true; try { localStorage.setItem('wpmDismissed', '1'); } catch {} }

	function onInput() {
		if (startAt === null && typed.length > 0) startAt = Date.now();
		// live accuracy
		let correct = 0;
		for (let i = 0; i < typed.length; i++) if (typed[i] === passage[i]) correct++;
		acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;
		if (typed.length >= passage.length) finish();
	}
	function finish() {
		finished = true;
		const mins = Math.max((Date.now() - startAt) / 60000, 1 / 60000);
		const words = passage.length / 5; // standard: 5 chars = 1 word
		wpm = Math.round((words / mins) * (acc / 100)); // net WPM (penalize errors)
		runs = [{ wpm, acc }, ...runs].slice(0, 5);
		if (wpm > best) { best = wpm; try { localStorage.setItem('wpmBest', String(best)); } catch {} }
	}
</script>

{#if !dismissed && !open}
	<button class="wpm-fab" on:click={openTest} title="Typing speed test">⌨ wpm test</button>
{/if}

{#if open}
	<div class="wpm-ad">
		<div class="wpm-bar">
			<span>⌨ create your own WPM on www.rhea.com!</span>
			<button class="wpm-x" on:click={dismiss} aria-label="Close">×</button>
		</div>
		<div class="wpm-body">
			{#if !finished}
				<p class="wpm-passage">
					{#each passage.split('') as ch, i}
						<span class={typed[i] === undefined ? 'u' : (typed[i] === ch ? 'ok' : 'bad')}>{ch}</span>
					{/each}
				</p>
				<textarea
					class="wpm-input"
					rows="3"
					bind:this={inputEl}
					bind:value={typed}
					on:input={onInput}
					placeholder="start typing the line above…"
					spellcheck="false"
				></textarea>
				<div class="wpm-meta">
					<span>best: <b>{best}</b> wpm</span>
					<span>accuracy: {acc}%</span>
				</div>
			{:else}
				<div class="wpm-result">
					<div class="wpm-score">{wpm} <small>wpm</small></div>
					<div class="wpm-sub">{acc}% accuracy · personal best {best} wpm</div>
					{#if runs.length > 1}
						<div class="wpm-board">
							<div class="wpm-board-head">this session</div>
							{#each runs as r, i}
								<div class="wpm-row"><span>#{i + 1}</span><span>{r.wpm} wpm</span><span>{r.acc}%</span></div>
							{/each}
						</div>
					{/if}
					<button class="wpm-again" on:click={() => reset()}>try again →</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.wpm-fab {
		position: fixed; left: 14px; bottom: 44px; z-index: 9400;
		background: #c0c0c0; color: #000;
		border: 2px solid #000; border-color: #fff #808080 #808080 #fff;
		padding: 7px 11px; font: inherit; font-size: 0.78rem; cursor: pointer;
		box-shadow: 2px 2px 0 rgba(0,0,0,0.35);
	}
	.wpm-fab:hover { background: #cfcfcf; }
	.wpm-ad {
		position: fixed; left: 14px; bottom: 44px; z-index: 9400;
		width: min(380px, 92vw);
		background: #c0c0c0; border: 2px solid #000;
		box-shadow: 4px 4px 0 rgba(0,0,0,0.45);
		font-family: var(--font-family, monospace);
		animation: wpmPop 0.18s ease-out;
	}
	@keyframes wpmPop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
	.wpm-bar {
		display: flex; align-items: center; justify-content: space-between;
		padding: 6px 10px; background: #000080; color: #fff;
		font-size: 0.8rem; font-weight: 700;
	}
	.wpm-x { background: none; border: none; color: #fff; font-size: 1.1rem; line-height: 1; cursor: pointer; }
	.wpm-body { padding: 12px; }
	.wpm-passage {
		font-size: 0.92rem; line-height: 1.5; margin: 0 0 10px;
		background: #f7f7f7; border: 1px solid #000; padding: 10px;
	}
	.wpm-passage .u { color: #888; }
	.wpm-passage .ok { color: #000; background: #c7f0c7; }
	.wpm-passage .bad { color: #fff; background: #d83b3b; }
	.wpm-input {
		width: 100%; box-sizing: border-box; border: 1px solid #000;
		background: #fff; padding: 8px; font: inherit; font-size: 0.9rem; resize: none;
	}
	.wpm-meta { display: flex; justify-content: space-between; font-size: 0.78rem; margin-top: 8px; color: #333; }
	.wpm-result { text-align: center; }
	.wpm-score { font-size: 2.6rem; font-weight: 700; line-height: 1; }
	.wpm-score small { font-size: 1rem; font-weight: 400; }
	.wpm-sub { font-size: 0.82rem; color: #333; margin: 6px 0 12px; }
	.wpm-board { border: 1px solid #000; background: #f7f7f7; margin-bottom: 12px; text-align: left; }
	.wpm-board-head { background: #000; color: #fff; font-size: 0.72rem; padding: 3px 8px; }
	.wpm-row { display: flex; justify-content: space-between; padding: 3px 8px; font-size: 0.8rem; }
	.wpm-again { background: #000; color: #fff; border: none; padding: 8px 16px; font: inherit; font-weight: 700; cursor: pointer; }
	@media (max-width: 600px) { .wpm-fab, .wpm-ad { left: 8px; bottom: 40px; } }
</style>
