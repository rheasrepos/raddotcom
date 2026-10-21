// Finder-style window list operations. Every function takes the current
// `windows` array and returns a NEW one (so Svelte sees the change):
//   windows = openFolder(windows, 'research');
//
// A FOLDER window navigates in place (breadcrumb `stack` + back button);
// opening a subfolder changes the same window, not a new one. A FILE window
// shows a real preview of one post.
import { categoryConfig } from '$lib/categories.js';
import { prettyFolder, BC } from './content.js';

let winSeq = 1; // ids
let winZ = 20;  // stacking order — the last-touched window is on top

function cascade(windows) {
	const n = windows.length;
	return { x: 60 + n * 34, y: 70 + n * 30 };
}

// Open a top-level category folder (its stack starts at that category),
// optionally already inside one of its subfolders (used when arriving from a
// post's clickable breadcrumb: /?open=<cat>&sub=<subfolder>).
export function openFolder(windows, categoryId, subfolder = null) {
	const info = categoryConfig[categoryId];
	if (!info) return windows;
	const { x, y } = cascade(windows);
	const stack = [{ category: categoryId, subfolder: null, title: info.label }];
	// "Before College / <sub>" arrives as one param → two levels, so Back works
	if (subfolder && subfolder.startsWith(BC + '/')) stack.push({ category: categoryId, subfolder: BC, title: prettyFolder(BC) });
	if (subfolder) stack.push({ category: categoryId, subfolder, title: prettyFolder(subfolder) });
	return [...windows, {
		id: winSeq++, kind: 'folder', stack,
		x, y, w: 640, h: 440, z: ++winZ, minimized: false
	}];
}

// Open a post as its own preview window.
export function openFile(windows, post) {
	const { x, y } = cascade(windows);
	return [...windows, {
		id: winSeq++, kind: 'file', post,
		x, y, w: 680, h: 560, z: ++winZ, minimized: false
	}];
}

export function focusWindow(windows, id) {
	const w = windows.find((x) => x.id === id);
	if (w) { w.z = ++winZ; w.minimized = false; }
	return [...windows];
}

export function closeWindow(windows, id) {
	return windows.filter((x) => x.id !== id);
}

export function minimizeWindow(windows, id) {
	const w = windows.find((x) => x.id === id);
	if (w) w.minimized = true;
	return [...windows];
}

// Navigate INSIDE a folder window (push a subfolder / child category).
export function navInto(windows, win, category, subfolder, title) {
	win.stack = [...win.stack, { category, subfolder, title }];
	win.z = ++winZ;
	return [...windows];
}

// Back pops a level; at the TOP level it closes the window, returning you
// to the desktop (the "meta" view of all folders).
export function navBack(windows, win) {
	if (win.stack.length > 1) { win.stack = win.stack.slice(0, -1); return [...windows]; }
	return windows.filter((w) => w.id !== win.id);
}

export function windowTitle(win) {
	return win.kind === 'folder' ? win.stack.map((l) => l.title).join(' / ') : win.post.title;
}
