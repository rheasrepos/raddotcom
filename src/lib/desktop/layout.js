// Desktop icon layout math — pure functions, no Svelte state.
// Used by src/routes/+page.svelte to place folders and free-floating items.

// Spacing scales with zoom so icons don't pile up when enlarged. Up to
// 175% the gap tracks the icon size (keeps the slight overlap Rhea likes);
// past 175% spacing grows slower, so they deliberately overlap.
export function spaceFactor(z) {
	z = z || 1;
	return z <= 1.75 ? z : 1.75 + (z - 1.75) * 0.5;
}

// Lay items on a grid that FILLS the desktop width: pick the column count
// from an ideal step, then JUSTIFY the row so the last item's right edge
// meets the right margin — no dead space on the right, and the gap shrinks
// as items grow. Every icon stays fully on-screen (overlap allowed, never
// clipped, never pushed off-screen → no horizontal scroll).
export function gridPos(i, z, baseStep, iconW, startY, rowH, w, justify = true) {
	const margin = 24;
	const W = w || (typeof window !== 'undefined' ? window.innerWidth : 1200);
	const iw = iconW * z;
	const step0 = baseStep * spaceFactor(z);
	const cols = Math.max(1, Math.round((W - 2 * margin) / step0));
	// justify=true → spread the row so the last item meets the right margin
	// (fills the width). justify=false → compact, left-aligned (folders).
	const step = justify && cols > 1 ? (W - 2 * margin - iw) / (cols - 1) : step0;
	const col = i % cols, row = Math.floor(i / cols);
	let x = margin + col * step;
	x = Math.min(Math.max(margin, x), W - margin - iw);
	return { x, y: startY + row * rowH };
}

// Folders: compact row(s) at the top-left, like a real desktop.
// Row height covers icon + a wrapped 2-line label at any zoom.
export function defaultIconPos(i, z = 1, w) {
	return gridPos(i, z, 150, 110, 30, 190 * spaceFactor(z), w, false);
}

// (Loose items use defaultIconPos too, continuing the index after the
// folders — one grid, folders then art, no gap.)
