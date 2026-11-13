// The Resume tab is gone (Rhea, 2026-11-13): the resume is a "download resume"
// link on the About page. Old /resume links go straight to the PDF.
import { redirect } from '@sveltejs/kit';
export function load() {
	throw redirect(308, '/resume.pdf');
}
