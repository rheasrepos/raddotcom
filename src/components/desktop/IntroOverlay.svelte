<script>
	// Landing beat: the site name types itself out; click anywhere to enter
	// the desktop. Shown once per session (the page decides when).
	import { createEventDispatcher } from 'svelte';
	import AIText from '../AIText.svelte';
	export let typed = '';
	export let tagline = '';
	const dispatch = createEventDispatcher();
	const enter = () => dispatch('enter');
</script>

<div class="intro-overlay" on:click={enter} on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && enter()} role="button" tabindex="0">
	<div class="intro-inner">
		<img class="intro-tag" src="/hello-my-name-is-rhea.png" alt="HELLO my name is RHEA — a handwritten name tag" />
		<h1 class="intro-title">{typed}<span class="intro-caret">&nbsp;</span></h1>
		<div class="intro-sub">{tagline}</div>
		<div class="intro-hint">[ click anywhere to enter ]</div>
	</div>
	<div class="intro-ticker" data-no-reveal><span><AIText>double-click a folder to open it · press space to preview any file · ⌘K to search everything · drag the obsidian graph · wallpaper picker bottom-left · welcome to my desktop ·</AIText></span></div>
</div>

<style>
	.intro-overlay {
		position: fixed;
		inset: 0;
		background: #ff8c42;
		z-index: 5000;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		cursor: pointer;
		overflow: hidden;
	}
	.intro-tag { display: block; width: min(320px, 46vw); margin: 0 auto 22px; } /* Rhea's own cutout — it carries its shape and tilt */
	.intro-title {
		font-size: clamp(44px, 10vw, 120px);
		letter-spacing: -2px;
		margin: 0;
		color: #000;
	}
	.intro-caret {
		display: inline-block;
		width: 0.55em;
		background: #000;
		animation: introBlink 1s steps(1) infinite;
	}
	@keyframes introBlink { 50% { opacity: 0; } }
	.intro-sub { font-size: clamp(14px, 2vw, 20px); margin-top: 14px; color: #000; }
	.intro-hint { margin-top: 56px; font-size: 14px; animation: introBlink 1.6s steps(1) infinite; color: #000; }
	.intro-ticker {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: #000;
		color: #ff8c42;
		font-size: 12px;
		padding: 6px 0;
		white-space: nowrap;
		overflow: hidden;
	}
	.intro-ticker span { display: inline-block; padding-left: 100%; animation: introTick 18s linear infinite; }
	@keyframes introTick { to { transform: translateX(-100%); } }
</style>
