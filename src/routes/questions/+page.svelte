<script>
	// /questions — Rhea's open questions for research and problems she thinks we
	// should solve, quoted exactly from her notes. Source: the vault's _questions.md
	// (copied to src/data/questions.md by promote-to-site.command).
	// Each line: "- quote | where it came from". Section names and "where it came
	// from" were written by Claude, so they carry the AI underline; quotes are hers.
	import PageLayout from '../../components/PageLayout.svelte';
	import AIText from '../../components/AIText.svelte';
	import { onMount } from 'svelte';
	import { loadAnswers, sendAnswer } from '$lib/answers.js';
	// visitors can answer any question in the box beside it (anonymous)
	let answers = [], drafts = {}, sent = {}, open = {}, err = {};
	const refresh = async () => { try { answers = await loadAnswers(); } catch { answers = []; } };
	onMount(refresh);
	$: byQ = answers.reduce((m, a) => ((m[a.question] ||= []).push(a), m), {});
	async function send(q) {
		const t = (drafts[q] || '').trim(); if (!t) return;
		try { await sendAnswer(q, t); sent[q] = true; drafts[q] = ''; err[q] = false; await refresh(); } catch { err[q] = true; }
	}
	const raw = Object.values(import.meta.glob('/src/data/questions.md', { eager: true, query: '?raw', import: 'default' }))[0] || '';

	const sections = [];
	for (const line of raw.split('\n')) {
		const h = line.match(/^##\s+(.+)/);
		if (h) { sections.push({ name: h[1].trim(), items: [] }); continue; }
		const m = line.match(/^-\s+(.+)$/);
		if (m && sections.length) {
			const [q, from = '', ...links] = m[1].split(/\s+\|\s+/);
			sections[sections.length - 1].items.push({ q, from, links: links.filter(Boolean) });
		}
	}
	const total = sections.reduce((n, s) => n + s.items.length, 0);
	let query = '';
	$: shown = sections
		.map((s) => ({ ...s, items: s.items.filter((it) => !query.trim() || `${it.q} ${it.from}`.toLowerCase().includes(query.toLowerCase())) }))
		.filter((s) => s.items.length);
</script>

<PageLayout title="Questions - Rhea Madhogarhia">
<div class="qs">
	<header>
		<h1>Questions</h1>
		<p class="note"><AIText>Questions for research and problems worth solving, copied from Rhea's notes, lab notes and margins, with only spelling typos fixed. They're open: answer any of them in the box beside it (anonymous; answers are shared on the page), or if you're working on one, tell her.</AIText></p>
		<p class="note"><a href="/ai-problems">AI-fixable problems database →</a></p>
		<input class="search" type="search" placeholder="search {total} questions…" bind:value={query} />
	</header>

	{#each shown as s (s.name)}
		<section>
			<h2><AIText>{s.name}</AIText></h2>
			<ol>
				{#each s.items as it}
					<li>
						<div class="qa">
						<div class="qtext">
						<blockquote>“{it.q}”</blockquote>
						{#if it.from}<span class="from"><AIText>{it.from}</AIText></span>{/if}
						{#if it.links.length}<span class="qlinks">{#each it.links as l}<a href={l} target={l.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{l.includes('github.com') ? 'GitHub ↗' : 'page ↗'}</a>{/each}</span>{/if}
						{#if (byQ[it.q] || []).length}
							<button class="seeall" on:click={() => (open[it.q] = !open[it.q])}>{open[it.q] ? 'hide' : 'see'} answers ({byQ[it.q].length})</button>
							{#if open[it.q]}<ul class="others">{#each byQ[it.q].slice(0, 20) as a}<li>{a.answer}</li>{/each}</ul>{/if}
						{/if}
						</div>
						<div class="answer" data-no-reveal>
							<textarea rows="2" maxlength="1000" placeholder="your answer…" bind:value={drafts[it.q]}></textarea>
							<div class="arow">
								<button on:click={() => send(it.q)} disabled={!(drafts[it.q] || '').trim()}>send</button>
								{#if sent[it.q]}<span class="ok"><AIText>thanks, it's in.</AIText></span>{/if}
								{#if err[it.q]}<span class="ok"><AIText>that didn't go through; try again.</AIText></span>{/if}
							</div>
						</div>
						</div>
					</li>
				{/each}
			</ol>
		</section>
	{/each}
	{#if !shown.length}<p class="note" data-no-reveal><AIText>nothing matches.</AIText></p>{/if}
</div>
</PageLayout>

<style>
	.qs { padding: 4px 0 30px; max-width: 900px; }
	h1 { margin: 0 0 6px; }
	.note { margin: 6px 0; max-width: 70ch; font-size: 0.85rem; opacity: 0.85; }
	.note a { color: #000; }
	.search { width: 100%; max-width: 420px; box-sizing: border-box; margin: 10px 0 4px; padding: 6px 10px; border: 1px solid #000; background: #f7f7f7; font: inherit; }
	section { margin: 22px 0; }
	h2 { font-size: 1rem; margin: 0 0 8px; border-bottom: 1px solid #000; padding-bottom: 4px; }
	ol { margin: 0; padding-left: 1.4em; }
	li { padding: 8px 0; border-bottom: 1px dotted rgba(0, 0, 0, 0.25); }
	blockquote { margin: 0; font-size: 1rem; line-height: 1.45; }
	.qa { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 16px; align-items: start; }
	.answer textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 0.85rem; border: 1px solid #000; padding: 5px; background: #fff; resize: vertical; }
	.arow { display: flex; gap: 8px; align-items: center; margin-top: 3px; }
	.arow button, .seeall { font: inherit; font-size: 0.78rem; padding: 2px 10px; border: 1px solid #000; background: #c0c0c0; cursor: pointer; }
	.arow button:disabled { opacity: 0.5; cursor: default; }
	.seeall { margin-top: 6px; }
	.ok { font-size: 0.75rem; }
	.others { margin: 6px 0 0; padding-left: 1.1em; font-size: 0.85rem; }
	.others li { border: none; padding: 2px 0; }
	@media (max-width: 700px) { .qa { grid-template-columns: 1fr; } }
	.qlinks { display: inline-flex; gap: 10px; margin-top: 3px; font-size: 0.75rem; }
	.qlinks a { color: #000; }
	.from { display: block; margin-top: 3px; font-size: 0.72rem; opacity: 0.65; }
</style>
