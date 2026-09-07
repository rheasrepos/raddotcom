<script>
	// Floating "tell Rhea you visited" button → a little popup with a message
	// box for comments / suggestions / questions.
	//
	// WHERE SUBMISSIONS GO: this static site has no backend, so it posts to a
	// Formspree form (free) which emails Rhea. Paste your form id below. Until
	// you do, the button falls back to opening the visitor's email app.
	//   1. make a free form at https://formspree.io  →  copy the id (e.g. "xyzabcd")
	//   2. set FORMSPREE_ID to that id.  Done.
	const FORMSPREE_ID = ''; // e.g. 'xyzabcd' — empty = use mailto fallback
	const FALLBACK_EMAIL = 'rhea0866@gmail.com';

	import { onMount } from 'svelte';
	let open = false;
	let dismissed = false; // X'd out entirely (remembered per browser)
	let name = '';
	let message = '';
	let sending = false;
	let done = false;
	let error = '';

	onMount(() => {
		try { dismissed = localStorage.getItem('gbDismissed') === '1'; } catch {}
	});
	function dismiss() {
		dismissed = true;
		open = false;
		try { localStorage.setItem('gbDismissed', '1'); } catch {}
	}

	async function submit() {
		if (!message.trim()) { error = 'Add a note first!'; return; }
		error = '';
		if (!FORMSPREE_ID) {
			// no form service configured yet → open the visitor's mail client
			const subj = encodeURIComponent('Visited www.rhea.com!');
			const body = encodeURIComponent(`${message}\n\n— ${name || 'a visitor'}`);
			window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subj}&body=${body}`;
			done = true;
			return;
		}
		sending = true;
		try {
			const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, message, _subject: 'Someone visited www.rhea.com!' })
			});
			if (res.ok) { done = true; name = ''; message = ''; }
			else error = 'Hmm, that didn’t send. Try again?';
		} catch (e) {
			error = 'Network hiccup — try again?';
		} finally {
			sending = false;
		}
	}
</script>

{#if dismissed}
	<!-- fully dismissed: nothing shown -->
{:else if !open}
	<div class="gb-fab-wrap">
		<button class="gb-fab" on:click={() => (open = true)} title="Leave Rhea a note">
			tell rhea you visited her site! ✎
		</button>
		<button class="gb-dismiss" on:click={dismiss} title="Dismiss" aria-label="Dismiss">×</button>
	</div>
{:else}
	<div class="gb-card">
		<div class="gb-bar">
			<span>tell rhea you visited!</span>
			<button class="gb-x" on:click={() => (open = false)} aria-label="Close">×</button>
		</div>
		{#if done}
			<div class="gb-body gb-thanks">
				<p>thank you for visiting :) it means a lot.</p>
				<button class="gb-again" on:click={() => { done = false; }}>leave another note</button>
			</div>
		{:else}
			<div class="gb-body">
				<input class="gb-input" placeholder="your name (optional)" bind:value={name} />
				<textarea class="gb-text" rows="4" placeholder="a comment, suggestion, or question…" bind:value={message}></textarea>
				{#if error}<div class="gb-err">{error}</div>{/if}
				<button class="gb-send" on:click={submit} disabled={sending}>
					{sending ? 'sending…' : 'send'}
				</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.gb-fab-wrap { position: fixed; right: 14px; bottom: 44px; z-index: 9500; display: flex; align-items: flex-start; }
	.gb-dismiss {
		background: #c0c0c0;
		border: 2px solid #000;
		border-color: #ffffff #808080 #808080 #ffffff;
		color: #000;
		font-size: 0.9rem;
		line-height: 1;
		padding: 4px 6px;
		margin-left: -1px;
		cursor: pointer;
		box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.35);
	}
	.gb-dismiss:hover { background: #e88; }
	.gb-fab {
		position: static;
		background: #c0c0c0;
		color: #000;
		border: 2px solid #000;
		border-color: #ffffff #808080 #808080 #ffffff;
		padding: 8px 12px;
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
		box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.35);
	}
	.gb-fab:hover { background: #cfcfcf; }
	.gb-card {
		position: fixed;
		right: 14px;
		bottom: 44px;
		z-index: 9500;
		width: min(320px, 90vw);
		background: #c0c0c0;
		border: 2px solid #000;
		box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.4);
		font-family: var(--font-family, monospace);
	}
	.gb-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 10px;
		background: #000;
		color: #fff;
		font-size: 0.82rem;
		font-weight: 700;
	}
	.gb-x { background: none; border: none; color: #fff; font-size: 1.1rem; line-height: 1; cursor: pointer; padding: 0 2px; }
	.gb-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
	.gb-input, .gb-text {
		width: 100%;
		border: 1px solid #000;
		background: #f7f7f7;
		padding: 6px 8px;
		font: inherit;
		font-size: 0.82rem;
		box-sizing: border-box;
	}
	.gb-text { resize: vertical; }
	.gb-send {
		align-self: flex-end;
		background: #000;
		color: #fff;
		border: none;
		padding: 7px 16px;
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
	.gb-send:disabled { opacity: 0.6; cursor: default; }
	.gb-err { color: #b00020; font-size: 0.76rem; }
	.gb-thanks { text-align: center; font-size: 0.9rem; }
	.gb-again { background: none; border: none; text-decoration: underline; cursor: pointer; font: inherit; font-size: 0.78rem; color: #333; }
	@media (max-width: 600px) {
		.gb-fab { font-size: 0.72rem; right: 8px; bottom: 40px; }
	}
</style>
