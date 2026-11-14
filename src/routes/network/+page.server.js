import { redirect } from '@sveltejs/kit';
// The Obsidian page is now the Blog's Map view (Rhea, 2026-11-14)
export function load() { throw redirect(308, '/blog?view=map'); }
