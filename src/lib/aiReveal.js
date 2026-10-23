// NOTE: the reveal replaces text nodes, so text that UPDATES live (contains a
// {variable} that changes while shown) must opt out with data-no-reveal.
// AI-drafted text "generates" itself when it scrolls into view — word by word
// with a caret, like a model streaming tokens (and like the landing title
// typing itself out). Works on the <AIText> component AND on the
// <span/div class="ai-generated"> that markdown's <ai> tags produce.
//
//   use:aiReveal            on any container: animates every .ai-text / .ai-generated inside it
//   aiHidden (store)        true = hide all AI-drafted text (visitor's choice, remembered)
import { writable } from 'svelte/store';

const KEY = 'aiHidden';
const initial = typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1';
export const aiHidden = writable(initial);
aiHidden.subscribe((v) => {
	if (typeof document === 'undefined') return;
	document.documentElement.classList.toggle('hide-ai', v);
	try { localStorage.setItem(KEY, v ? '1' : '0'); } catch {}
});

const SEL = '.ai-text, .ai-generated';
const done = new WeakSet();

function wrapWords(el) {
	// wrap each word of each text node in a span (layout stays stable; we
	// only change opacity), skipping the popup note and any nested marker
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
		acceptNode: (n) => {
			if (!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
			let p = n.parentElement;
			while (p && p !== el) { if (p.classList.contains('ai-pop') || p.tagName === 'CODE' || p.tagName === 'PRE') return NodeFilter.FILTER_REJECT; p = p.parentElement; }
			return NodeFilter.FILTER_ACCEPT;
		}
	});
	const nodes = [];
	while (walker.nextNode()) nodes.push(walker.currentNode);
	const words = [];
	for (const n of nodes) {
		const frag = document.createDocumentFragment();
		for (const part of n.nodeValue.split(/(\s+)/)) {
			if (!part) continue;
			if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
			const s = document.createElement('span'); s.className = 'ai-w'; s.textContent = part; frag.appendChild(s); words.push(s);
		}
		n.parentNode.replaceChild(frag, n);
	}
	return words;
}

function reveal(el) {
	if (done.has(el)) return; done.add(el);
	const words = wrapWords(el);
	if (!words.length) return;
	el.classList.add('ai-revealing');
	// whole passage takes ~1.2–3s regardless of length
	const step = Math.max(14, Math.min(90, 2600 / words.length));
	let i = 0;
	const caret = document.createElement('span'); caret.className = 'ai-caret'; caret.textContent = '▌';
	const tick = () => {
		if (i < words.length) {
			words[i].classList.add('on');
			words[i].after(caret);
			i++;
			setTimeout(tick, step);
		} else { caret.remove(); el.classList.remove('ai-revealing'); }
	};
	tick();
}

export function aiReveal(node) {
	if (typeof IntersectionObserver === 'undefined') return;
	const io = new IntersectionObserver((entries) => {
		for (const e of entries) if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
	}, { threshold: 0.15 });
	const scan = () => {
		const els = node.matches && node.matches(SEL) ? [node] : [];
		node.querySelectorAll(SEL).forEach((el) => { if (!el.closest('.ai-generated .ai-generated') && !el.closest('[data-no-reveal]')) els.push(el); });
		els.forEach((el) => { if (!done.has(el)) io.observe(el); });
	};
	scan();
	const mo = new MutationObserver(scan);
	mo.observe(node, { childList: true, subtree: true });
	return { destroy() { io.disconnect(); mo.disconnect(); } };
}
