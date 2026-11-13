<script>
	// /complexity — Rhea's "what is complexity to you" questionnaire (questions are
	// hers, Data Cognition Lab notes, 2024 → written out 2026-11-13). Anonymous;
	// each question has a live chart of everyone's answers beside it.
	import { onMount, onDestroy } from 'svelte';
	import PageLayout from '../../components/PageLayout.svelte';
	import AIText from '../../components/AIText.svelte';
	import ComplexityStimulus, { STIMULI } from '../../components/ComplexityStimulus.svelte';
	import { loadAnswers, submitAnswer, configured, SCALES } from '$lib/complexity.js';

	let answers = [], status = '', sent = false, timer;
	let complexity = '', work = '', fun = '';
	let ranking = []; // stimulus ids, most → least complex
	let scales = Object.fromEntries(SCALES.map(([c]) => [c, null]));

	async function refresh() { try { answers = await loadAnswers(); } catch { status = 'error'; } }
	onMount(() => { refresh(); timer = setInterval(refresh, 20000); });
	onDestroy(() => clearInterval(timer));

	function tap(id) { ranking = ranking.includes(id) ? ranking.filter((x) => x !== id) : [...ranking, id]; }
	$: complete = ranking.length === STIMULI.length && SCALES.every(([c]) => scales[c]);

	async function send() {
		status = 'saving';
		try {
			await submitAnswer({ complexity: complexity.trim().slice(0, 1000) || null, work: work.trim().slice(0, 200) || null, fun: fun.trim().slice(0, 200) || null, ranking, ...scales });
			sent = true; status = ''; await refresh();
		} catch { status = 'error'; }
	}

	// ---- live summaries, for everyone or one work domain ----
	const norm = (w) => (w || '').trim().toLowerCase();
	let domain = ''; // '' = everyone
	$: domains = [...answers.reduce((m, a) => (norm(a.work) ? m.set(norm(a.work), (m.get(norm(a.work)) || 0) + 1) : m), new Map())].sort((a, b) => b[1] - a[1]);
	$: shown = domain ? answers.filter((a) => norm(a.work) === domain) : answers;
	$: n = answers.length;
	$: avgRank = Object.fromEntries(STIMULI.map((s) => {
		const ranks = shown.map((a) => (a.ranking || []).indexOf(s.id)).filter((i) => i >= 0).map((i) => i + 1);
		return [s.id, ranks.length ? ranks.reduce((x, y) => x + y, 0) / ranks.length : null];
	}));
	$: rankOrder = [...STIMULI].sort((a, b) => (avgRank[a.id] ?? 99) - (avgRank[b.id] ?? 99));
	function dist(col, rows) {
		const counts = [0, 0, 0, 0, 0, 0, 0];
		const vals = rows.map((a) => a[col]).filter((v) => v >= 1 && v <= 7);
		for (const v of vals) counts[v - 1]++;
		return { counts, max: Math.max(1, ...counts), mean: vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null, k: vals.length };
	}
	$: dists = Object.fromEntries(SCALES.map(([c]) => [c, dist(c, shown)]));
	const recent = (col, rows) => rows.map((a) => a[col]).filter(Boolean).slice(0, 12);
</script>

<PageLayout title="What is complexity to you? - Rhea Madhogarhia">
<div class="cx">
	<header>
		<h1>what is complexity to you?</h1>
		<p><AIText>a short, anonymous questionnaire. no names, nothing to sign in to. every answer joins the charts beside each question as soon as it's sent.</AIText></p>
		<p class="count" data-no-reveal><AIText>{n} {n === 1 ? 'person has' : 'people have'} answered{configured ? '' : ' (this browser only: the shared table isn\'t connected yet)'}.</AIText></p>
		<label class="domain" data-no-reveal><AIText>charts show answers from</AIText>
			<select bind:value={domain}>
				<option value="">everyone</option>
				{#each domains as [d, c]}<option value={d}>{d} ({c})</option>{/each}
			</select>
		</label>
	</header>

	<section class="q">
		<div class="ask">
			<h2>what is complexity to you?</h2>
			<textarea bind:value={complexity} maxlength="1000" rows="4" disabled={sent}></textarea>
		</div>
		<div class="viz" data-no-reveal>
			<h3><AIText>what others wrote</AIText></h3>
			{#each recent('complexity', shown) as t}<p class="said">{t}</p>{:else}<p class="empty"><AIText>nothing yet</AIText></p>{/each}
		</div>
	</section>

	<section class="q">
		<div class="ask">
			<h2>sort from most complex to least complex</h2>
			<p class="hint"><AIText>tap the pictures in order, most complex first. tap again to take one back.</AIText></p>
			<div class="stims">
				{#each STIMULI as s}
					<button class="stim" class:picked={ranking.includes(s.id)} on:click={() => tap(s.id)} disabled={sent} aria-label={s.label}>
						<ComplexityStimulus id={s.id} />
						{#if ranking.includes(s.id)}<span class="rank">{ranking.indexOf(s.id) + 1}</span>{/if}
					</button>
				{/each}
			</div>
		</div>
		<div class="viz" data-no-reveal>
			<h3><AIText>everyone's average order (1 = most complex)</AIText></h3>
			{#each rankOrder as s}
				<div class="row">
					<span class="thumb"><ComplexityStimulus id={s.id} /></span>
					<span class="bar"><i style="width:{avgRank[s.id] ? ((STIMULI.length + 1 - avgRank[s.id]) / STIMULI.length) * 100 : 0}%"></i></span>
					<span class="num">{avgRank[s.id] ? avgRank[s.id].toFixed(1) : '–'}</span>
				</div>
			{/each}
		</div>
	</section>

	<section class="q">
		<div class="ask">
			<h2>what do you do for work?</h2>
			<input bind:value={work} maxlength="200" disabled={sent} />
			<h2>what do you do for fun?</h2>
			<input bind:value={fun} maxlength="200" disabled={sent} />
		</div>
		<div class="viz" data-no-reveal>
			<h3><AIText>work, recently</AIText></h3>
			<div class="chips">{#each recent('work', answers) as t}<span>{t}</span>{:else}<span class="empty"><AIText>nothing yet</AIText></span>{/each}</div>
			<h3><AIText>fun, recently</AIText></h3>
			<div class="chips">{#each recent('fun', shown) as t}<span>{t}</span>{:else}<span class="empty"><AIText>nothing yet</AIText></span>{/each}</div>
		</div>
	</section>

	<h2 class="lead">rate complex on a scale of:</h2>
	{#each SCALES as [col, left, right]}
		<section class="q">
			<div class="ask">
				<h2>{left} to {right}</h2>
				<div class="likert">
					<span>{left}</span>
					{#each [1, 2, 3, 4, 5, 6, 7] as v}
						<label><input type="radio" bind:group={scales[col]} value={v} disabled={sent} /><b>{v}</b></label>
					{/each}
					<span>{right}</span>
				</div>
			</div>
			<div class="viz" data-no-reveal>
				<div class="hist">
					{#each dists[col].counts as c, i}<i style="height:{(c / dists[col].max) * 100}%" class:mine={sent && scales[col] === i + 1} title="{c}"></i>{/each}
				</div>
				<div class="ends"><span>{left}</span><span>{right}</span></div>
				<p class="mean"><AIText>{dists[col].mean ? `average ${dists[col].mean.toFixed(1)} of 7, from ${dists[col].k}` : 'no ratings yet'}</AIText></p>
			</div>
		</section>
	{/each}

	<div class="send" data-no-reveal>
		{#if sent}
			<p><AIText>thank you. your answers are in the charts above (yours are outlined).</AIText></p>
		{:else}
			<button on:click={send} disabled={!complete || status === 'saving'}>send</button>
			{#if !complete}<span><AIText>sort all six pictures and pick a number on each scale to send.</AIText></span>{/if}
			{#if status === 'error'}<span><AIText>that didn't go through. try again in a moment.</AIText></span>{/if}
		{/if}
	</div>
</div>
</PageLayout>

<style>
	.cx { padding: 4px 0 30px; max-width: 1000px; }
	.cx h1 { margin: 0 0 6px; }
	header p { margin: 0 0 6px; max-width: 70ch; opacity: 0.85; }
	.count { font-size: 0.85rem; }
	.domain { font-size: 0.85rem; display: flex; gap: 8px; align-items: center; position: sticky; top: 0; background: #fff; padding: 4px 0; z-index: 1; }
	.domain select { font: inherit; border: 1px solid #000; }
	.q { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 18px; border-top: 1px solid #000; padding: 14px 0; }
	.q h2, .lead { font-size: 1rem; margin: 0 0 8px; }
	.lead { margin-top: 18px; }
	.q h3 { font-size: 0.75rem; margin: 0 0 6px; font-weight: normal; opacity: 0.7; }
	textarea, input:not([type]) { width: 100%; box-sizing: border-box; font: inherit; border: 1px solid #000; padding: 6px; margin-bottom: 10px; background: #fff; }
	.hint { font-size: 0.8rem; margin: 0 0 8px; opacity: 0.8; }
	.stims { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
	.stim { position: relative; padding: 0; border: 2px solid transparent; background: none; cursor: pointer; }
	.stim.picked { border-color: #000; }
	.stim .rank { position: absolute; top: 4px; left: 4px; background: #000; color: #fff; font-size: 0.8rem; padding: 1px 6px; }
	.viz { background: #f4f4f4; border: 1px solid #000; padding: 10px; font-size: 0.85rem; min-width: 0; }
	.said { margin: 0 0 6px; padding-bottom: 6px; border-bottom: 1px dashed #bbb; overflow-wrap: anywhere; }
	.empty { opacity: 0.6; }
	.row { display: grid; grid-template-columns: 28px 1fr 30px; gap: 8px; align-items: center; margin-bottom: 4px; }
	.bar { height: 10px; background: #fff; border: 1px solid #000; }
	.bar i { display: block; height: 100%; background: #000; }
	.num { text-align: right; font-variant-numeric: tabular-nums; }
	.chips { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
	.chips span { border: 1px solid #000; padding: 1px 6px; background: #fff; }
	.likert { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.likert label { display: flex; flex-direction: column; align-items: center; font-size: 0.75rem; cursor: pointer; }
	.likert b { font-weight: normal; }
	.hist { display: flex; align-items: flex-end; gap: 3px; height: 60px; }
	.hist i { flex: 1; background: #000; min-height: 1px; }
	.hist i.mine { background: #fff; outline: 2px solid #000; }
	.ends { display: flex; justify-content: space-between; font-size: 0.75rem; margin-top: 3px; }
	.mean { margin: 6px 0 0; }
	.send { border-top: 1px solid #000; padding-top: 14px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
	.send button { font: inherit; padding: 6px 18px; border: 2px solid #000; background: #c0c0c0; cursor: pointer; }
	.send button:disabled { opacity: 0.5; cursor: default; }
	@media (max-width: 700px) { .q { grid-template-columns: 1fr; } }
</style>
