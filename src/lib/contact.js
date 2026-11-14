// Rhea's public email (2026-11-13): rm7722 [AT] nyu [DOT] edu.
// Kept out of the page HTML so scrapers don't harvest it; assembled only when
// someone clicks the email icon.
export const EMAIL_SHOWN = 'rm7722 [AT] nyu [DOT] edu';
export const email = () => ['rm7722', 'nyu.edu'].join('@');
export function openEmail(e) {
	e?.preventDefault?.();
	window.location.href = 'mailto:' + email();
}
