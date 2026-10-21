<script>
	// /wpm — the leaderboard wall, and a button to do a new one. Same test as
	// the popup (components/WpmTest.svelte), just given the whole page.
	import PageLayout from '../../components/PageLayout.svelte';
	import AIText from '../../components/AIText.svelte';
	import WpmTest from '../../components/WpmTest.svelte';
</script>

<PageLayout title="WPM - Rhea Madhogarhia">
<div class="wpm-page">
	<header>
		<h1>⌨ WPM</h1>
		<p><AIText>one minute, write anything, get a words-per-minute. everything visitors pinned is below — sort by fastest for the leaderboard.</AIText></p>
	</header>
	<div class="wpm-box">
		<WpmTest initial="wall" page />
	</div>
</div>
</PageLayout>

<style>
	.wpm-page { padding: 4px 0 20px; }
	.wpm-page h1 { margin: 0 0 6px; }
	.wpm-page header p { margin: 0 0 14px; max-width: 70ch; opacity: 0.85; }
	.wpm-box { background: #c0c0c0; border: 2px solid #000; box-shadow: 4px 4px 0 rgba(0,0,0,0.45); color: #000; }
</style>
