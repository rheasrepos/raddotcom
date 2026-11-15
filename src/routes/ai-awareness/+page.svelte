<script>
	// /ai-awareness — "Screen Time, but for AI." A concept demo: the numbers are
	// SAMPLE data to show what a local, on-device tracker would surface (active
	// use, passive exposure, reliance). The page does NOT track the visitor.
	// Design mirrors /ai-problems (classic-Windows .sheet window + statusbar).
	// Every sentence of wording here was drafted by an LLM (Claude), so prose is
	// wrapped in <AIText>; the counts, names and metric labels are data and stay bare.
	import PageLayout from '../../components/PageLayout.svelte';
	import AIText from '../../components/AIText.svelte';

	// active=green, passive=olive, reliance=maroon, accent=navy (the /ai-problems palette)
	const C = { active: '#008000', passive: '#808000', reliance: '#800000', accent: '#000080' };

	const DATA = {
		today: {
			stats: [
				{ k: 'AI touchpoints', v: '60', d: 'across 6 surfaces', c: C.accent },
				{ k: 'Active AI time', v: '69m', d: '31 prompts sent', c: C.active },
				{ k: 'Passive exposures', v: '37', d: "you didn't ask for these", dAI: true, c: C.passive },
				{ k: 'AI answer, no source', v: '74%', d: 'of AI Overviews', c: C.reliance }
			],
			surfaces: [
				{ n: 'Google AI Overview', meta: 'shown 23 · read 6 · scrolled past 17', val: '23', pct: 100, c: C.passive, ab: 'P', ic: 'G' },
				{ n: 'Claude', meta: '7 sessions · 48 min · 31 prompts', val: '48m', pct: 70, c: C.active, ab: 'A', ic: 'C' },
				{ n: 'AI-generated text you read', meta: 'feeds, replies and summaries — likely AI-written', metaAI: true, val: '19', pct: 48, c: C.passive, ab: 'P', ic: 'Tx' },
				{ n: 'Email smart suggestions', meta: '14 shown · 9 accepted', val: '14', pct: 38, c: C.passive, ab: 'P', ic: 'Em' },
				{ n: 'Gemini', meta: '4 sessions · 12 min', val: '12m', pct: 18, c: C.active, ab: 'A', ic: 'Ge' },
				{ n: 'ChatGPT', meta: '2 sessions · 9 min', val: '9m', pct: 13, c: C.active, ab: 'A', ic: 'GP' }
			],
			reliance: [
				{ l: 'Accepted an AI Overview instead of opening a source', v: '17/23' },
				{ l: 'Copied AI output straight into your work', v: '8×' },
				{ l: "Re-asked something you'd just looked up", v: '5×' },
				{ l: 'Sent a prompt within 30s of a dead end', v: '6×' }
			],
			insight: [
				'Quick gut check: did your guess land near 60? Most people count their chat time and miss everything else.',
				'You chose AI for 69 minutes today — but AI chose you 37 times: Overviews you scrolled past, smart-replies you accepted, and 19 pieces of AI-written text you read without clocking them.',
				"On 74% of searches you took the AI answer without opening a source. The gap between the AI you notice and the AI you don't — that's the whole point of this tool."
			]
		},
		week: {
			stats: [
				{ k: 'AI touchpoints', v: '418', d: '~60 / day', c: C.accent },
				{ k: 'Active AI time', v: '7.6h', d: '214 prompts', c: C.active },
				{ k: 'Passive exposures', v: '261', d: '62% of all touchpoints', c: C.passive },
				{ k: 'AI answer, no source', v: '69%', d: 'weekly average', c: C.reliance }
			],
			surfaces: [
				{ n: 'Google AI Overview', meta: 'shown 161 · read 48 · scrolled past 113', val: '161', pct: 100, c: C.passive, ab: 'P', ic: 'G' },
				{ n: 'Claude', meta: '38 sessions · 5.1 h', val: '5.1h', pct: 67, c: C.active, ab: 'A', ic: 'C' },
				{ n: 'AI-generated text you read', meta: 'feeds, replies and summaries — likely AI-written', metaAI: true, val: '128', pct: 79, c: C.passive, ab: 'P', ic: 'Tx' },
				{ n: 'Email smart suggestions', meta: '92 shown · 61 accepted', val: '92', pct: 57, c: C.passive, ab: 'P', ic: 'Em' },
				{ n: 'Gemini', meta: '19 sessions · 1.4 h', val: '1.4h', pct: 20, c: C.active, ab: 'A', ic: 'Ge' },
				{ n: 'ChatGPT', meta: '11 sessions · 1.1 h', val: '1.1h', pct: 15, c: C.active, ab: 'A', ic: 'GP' }
			],
			reliance: [
				{ l: 'Accepted an AI Overview instead of opening a source', v: '113/161' },
				{ l: 'Copied AI output straight into your work', v: '54×' },
				{ l: "Re-asked something you'd just looked up", v: '31×' },
				{ l: 'Sent a prompt within 30s of a dead end', v: '44×' }
			],
			insight: [
				'Over the week, 62% of your AI contact was passive — shown to you, not sought out, including 128 pieces of likely AI-written text. Most people guess the opposite about themselves.',
				'Your active AI time is steady; what\'s climbing is reliance — you opened a source on fewer than 1 in 3 AI Overviews.',
				'This week\'s experiment: pick one recurring question type and answer it without AI once, just to feel where your own instinct still is.'
			]
		}
	};

	const WEEK = [
		{ d: 'Mon', a: 48, p: 34, r: 22 }, { d: 'Tue', a: 71, p: 41, r: 29 }, { d: 'Wed', a: 39, p: 52, r: 33 },
		{ d: 'Thu', a: 63, p: 38, r: 26 }, { d: 'Fri', a: 88, p: 46, r: 31 }, { d: 'Sat', a: 29, p: 31, r: 19 }, { d: 'Sun', a: 69, p: 37, r: 28 }
	];
	const maxTot = Math.max(...WEEK.map((w) => w.a + w.p + w.r));

	let range = 'today';
	$: d = DATA[range];

	// Self-check: guess before you look.
	let guess = 20;
	let revealed = false;
	const ACTUAL = 60;
	$: diff = ACTUAL - guess;
</script>

<PageLayout title="AI Awareness — Rhea Madhogarhia">
	<section class="sheet">
		<div class="titlebar">
			<span class="title">AI Awareness — Awareness.exe</span>
			<span class="winbtns" aria-hidden="true"><i>_</i><i>□</i><i>×</i></span>
		</div>
		<div class="body">
			<header class="head">
				<h1><AIText>Do you actually know how much you use AI?</AIText></h1>
				<p><AIText>Screen Time, but for the AI in your day — what you chose, what was shown to you, and what you
					leaned on. Most people picture their chatbot time and stop there; this counts the rest.</AIText></p>
			</header>

			<p class="disclaimer"><AIText>These numbers are sample data to show the idea — this page doesn't track you.
				It's a mock-up of what a local, on-device tracker (a browser extension that stores everything in your
				browser only) would surface.</AIText></p>

			<fieldset class="poll">
				<legend><AIText>Self-check: guess before you look</AIText></legend>
				<label class="gq"><AIText>Guess your AI touchpoints today, then reveal the (sample) reality.</AIText></label>
				<input class="slider" type="range" min="0" max="120" bind:value={guess} />
				<div class="poll-row">
					<span class="gval">{guess}</span>
					<button class="btn" on:click={() => (revealed = true)}>Reveal reality</button>
				</div>
				{#if revealed}
					<p class="gout" data-no-reveal>
						{#if guess >= ACTUAL}
							<AIText>You guessed {guess}. Sample actual: {ACTUAL}. You're in the rare group that doesn't
								under-count — but 37 of those 60 were passive, shown to you rather than chosen.</AIText>
						{:else}
							<AIText>You guessed {guess}. Sample actual: {ACTUAL} — that's {diff} more than you thought. And 37
								of them were passive: AI shown to you, not chosen. That blind spot is exactly what this tracks.</AIText>
						{/if}
					</p>
				{/if}
			</fieldset>

			<nav class="tabs" role="tablist">
				<button role="tab" aria-selected={range === 'today'} class:on={range === 'today'} on:click={() => (range = 'today')}>Today</button>
				<button role="tab" aria-selected={range === 'week'} class:on={range === 'week'} on:click={() => (range = 'week')}>This week</button>
			</nav>

			<div class="grid4" data-no-reveal>
				{#each d.stats as s}
					<div class="stat">
						<div class="k">{s.k}</div>
						<div class="v" style="color: {s.c}">{s.v}</div>
						<div class="sub">{#if s.dAI}<AIText>{s.d}</AIText>{:else}{s.d}{/if}</div>
						<div class="bar"><i style="background: {s.c}"></i></div>
					</div>
				{/each}
			</div>

			<h2 class="sect"><AIText>Where the AI showed up</AIText> <span class="tag">active</span> <span class="tag">passive</span></h2>
			<div class="panel" data-no-reveal>
				{#each d.surfaces as s}
					<div class="srow">
						<span class="ic" style="background: {s.c}">{s.ic}</span>
						<span class="sinfo">
							<span class="sname">{s.n} <span class="tag">{s.ab === 'A' ? 'active' : 'passive'}</span></span>
							<span class="smeta">{#if s.metaAI}<AIText>{s.meta}</AIText>{:else}{s.meta}{/if}</span>
						</span>
						<span class="track"><span class="fill" style="width: {s.pct}%; background: {s.c}"></span></span>
						<span class="sval">{s.val}</span>
					</div>
				{/each}
			</div>

			<p class="disclaimer"><AIText>Known blind spot: this can't reliably measure how much AI-created content you
				consume — most AI-written text, images and summaries carry no label. The "AI-generated text you read"
				figure is a rough estimate from detectable sources only, not a true count.</AIText></p>

			<div class="cols">
				<div class="panel">
					<div class="legend"><AIText>7-day trend</AIText></div>
					<div class="week">
						{#each WEEK as w}
							<div class="daycol">
								<div class="stack" style="height: {Math.round(((w.a + w.p + w.r) / maxTot) * 100)}%">
									<i style="height: {(w.r / (w.a + w.p + w.r)) * 100}%; background: {C.reliance}"></i>
									<i style="height: {(w.p / (w.a + w.p + w.r)) * 100}%; background: {C.passive}"></i>
									<i style="height: {(w.a / (w.a + w.p + w.r)) * 100}%; background: {C.active}"></i>
								</div>
								<span class="dl">{w.d}</span>
							</div>
						{/each}
					</div>
					<div class="wklegend">
						<span><i style="background: {C.active}"></i> active</span>
						<span><i style="background: {C.passive}"></i> passive</span>
						<span><i style="background: {C.reliance}"></i> relied, no check</span>
					</div>
				</div>
				<div class="panel" data-no-reveal>
					<div class="legend"><AIText>Reliance signals</AIText> <span class="tag">dependence</span></div>
					{#each d.reliance as r}
						<div class="relrow"><span class="rl"><AIText>{r.l}</AIText></span><span class="rv">{r.v}</span></div>
					{/each}
				</div>
			</div>

			<h2 class="sect"><AIText>What it adds up to</AIText></h2>
			<div class="reading" data-no-reveal>
				{#each d.insight as p}<p><AIText>{p}</AIText></p>{/each}
			</div>

			<div class="statusbar">
				<span>Prototype · sample data</span>
				<span><AIText>A real version would track this on-device only</AIText></span>
				<span>No network</span>
			</div>
		</div>
	</section>
</PageLayout>

<style>
	/* Mirrors /ai-problems: classic-Windows grey chrome, bevelled edges, navy title bar. */
	.sheet {
		--face: #c0c0c0; --hi: #ffffff; --lo: #808080; --dk: #000000; --navy: #000080;
		font-family: Tahoma, 'MS Sans Serif', 'Segoe UI', Geneva, sans-serif !important;
		font-size: 13px; color: #000; background: var(--face); margin: 1rem 0; padding: 3px;
		border: 2px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi);
		box-shadow: inset -1px -1px var(--lo), inset 1px 1px #dfdfdf;
	}
	.sheet :global(*) { font-family: inherit !important; }
	.titlebar {
		display: flex; align-items: center; justify-content: space-between; padding: 3px 4px 3px 6px;
		background: linear-gradient(90deg, var(--navy), #1084d0); color: #fff; font-weight: bold;
	}
	.title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.winbtns { display: flex; gap: 2px; }
	.winbtns i {
		font-style: normal; width: 16px; height: 14px; line-height: 12px; text-align: center; font-size: 11px;
		background: var(--face); color: #000; border: 1px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi);
	}
	.body { padding: 10px; }
	.head h1 { font-size: 18px; font-weight: bold; margin: 0 0 4px; color: #000; }
	.head p { max-width: 80ch; line-height: 1.45; margin: 0 0 12px; }

	.disclaimer { margin: 0 0 12px; padding: 6px 8px; font-size: 12px; background: #ffffe1; border: 1px solid #000; max-width: 80ch; line-height: 1.45; }

	.poll { margin: 0 0 12px; padding: 8px 10px 10px; border: 2px groove var(--hi); }
	.poll legend { font-weight: bold; padding: 0 4px; }
	.gq { display: block; margin-bottom: 8px; }
	.slider { width: 100%; max-width: 420px; height: 22px; -webkit-appearance: none; appearance: none; background: var(--face); outline: none; cursor: pointer; }
	.slider::-webkit-slider-runnable-track { height: 6px; background: var(--lo); border: 1px solid; border-color: var(--dk) var(--hi) var(--hi) var(--dk); }
	.slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 22px; margin-top: -9px; background: var(--face); border: 2px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi); box-shadow: inset -1px -1px var(--lo); }
	.slider::-moz-range-track { height: 6px; background: var(--lo); }
	.slider::-moz-range-thumb { width: 14px; height: 22px; border-radius: 0; background: var(--face); border: 2px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi); }
	.poll-row { display: flex; gap: 10px; align-items: center; margin-top: 10px; }
	.gval { font-size: 22px; font-weight: bold; min-width: 2.5rem; }
	.btn { background: var(--face); font: inherit; padding: 3px 14px; cursor: pointer; border: 2px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi); box-shadow: inset -1px -1px var(--lo); }
	.btn:active { border-color: var(--dk) var(--hi) var(--hi) var(--dk); }
	.gout { margin: 12px 0 0; padding: 6px 8px; background: #ffffe1; border: 1px solid #000; max-width: 80ch; line-height: 1.45; }

	.tabs { display: flex; gap: 0; padding-left: 2px; position: relative; z-index: 1; }
	.tabs button {
		background: var(--face); color: #000; font: inherit; cursor: pointer; padding: 3px 14px; margin-top: 2px;
		border: 2px solid; border-bottom: none; border-color: var(--hi) var(--lo) transparent var(--hi); border-radius: 3px 3px 0 0;
	}
	.tabs button.on { margin-top: 0; padding-bottom: 5px; margin-bottom: -2px; font-weight: bold; }

	.grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 0 0 12px; }
	.stat { padding: 8px; background: #fff; border: 2px solid; border-color: var(--lo) var(--hi) var(--hi) var(--lo); box-shadow: inset 1px 1px var(--dk); }
	.stat .k { font-size: 11px; color: #404040; font-weight: bold; text-transform: uppercase; }
	.stat .v { font-size: 28px; font-weight: bold; margin: 4px 0 2px; }
	.stat .sub { font-size: 12px; color: #404040; }
	.stat .bar { height: 10px; margin-top: 8px; background: var(--face); border: 1px solid; border-color: var(--lo) var(--hi) var(--hi) var(--lo); }
	.stat .bar i { display: block; height: 100%; }

	.sect { font-size: 14px; font-weight: bold; margin: 4px 0 6px; display: flex; align-items: center; gap: 8px; }
	.tag { font-size: 11px; padding: 0 5px; background: var(--face); border: 1px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi); font-weight: normal; }

	.panel { padding: 8px 10px; background: #fff; border: 2px solid; border-color: var(--lo) var(--hi) var(--hi) var(--lo); box-shadow: inset 1px 1px var(--dk); margin: 0 0 12px; }
	.legend { font-weight: bold; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }

	.srow { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px dotted var(--lo); }
	.srow:last-child { border-bottom: none; }
	.ic { width: 30px; height: 26px; flex-shrink: 0; display: grid; place-items: center; color: #fff; font-size: 12px; font-weight: bold; border: 1px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi); }
	.sinfo { flex: 0 0 210px; min-width: 0; display: flex; flex-direction: column; }
	.sname { font-weight: bold; }
	.smeta { font-size: 12px; color: #404040; }
	.track { flex: 1; height: 14px; min-width: 50px; background: #fff; border: 2px solid; border-color: var(--lo) var(--hi) var(--hi) var(--lo); box-shadow: inset 1px 1px var(--dk); padding: 1px; overflow: hidden; }
	.fill { display: block; height: 100%; }
	.sval { width: 52px; text-align: right; font-weight: bold; flex-shrink: 0; }

	.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
	.week { display: flex; align-items: flex-end; gap: 7px; height: 140px; padding: 6px 2px 0; }
	.daycol { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; height: 100%; justify-content: flex-end; }
	.stack { width: 80%; max-width: 30px; display: flex; flex-direction: column-reverse; border: 1px solid var(--dk); }
	.stack i { display: block; width: 100%; }
	.dl { font-size: 11px; color: #404040; font-weight: bold; }
	.wklegend { display: flex; gap: 12px; flex-wrap: wrap; font-size: 12px; color: #404040; margin-top: 10px; }
	.wklegend span { display: inline-flex; align-items: center; gap: 5px; }
	.wklegend i { width: 11px; height: 11px; display: inline-block; border: 1px solid var(--dk); }

	.relrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 0; border-bottom: 1px dotted var(--lo); }
	.relrow:last-child { border-bottom: none; }
	.rl { font-size: 13px; }
	.rv { font-size: 18px; font-weight: bold; color: #800000; white-space: nowrap; }

	.reading { max-width: 80ch; }
	.reading p { line-height: 1.5; margin: 0 0 8px; }

	.statusbar { display: flex; gap: 2px; margin-top: 10px; }
	.statusbar span { flex: 1; padding: 2px 6px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border: 1px solid; border-color: var(--lo) var(--hi) var(--hi) var(--lo); }

	@media (max-width: 768px) {
		.body { padding: 6px; }
		.grid4 { grid-template-columns: repeat(2, 1fr); }
		.cols { grid-template-columns: 1fr; }
		.sinfo { flex-basis: 150px; }
		.statusbar span:nth-child(3) { display: none; }
	}
</style>
