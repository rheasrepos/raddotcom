// One place to rename the site — everything reads from here.

// The title rotates: a different one each visit. Edit/reorder freely;
// delete all but one to lock a single name.
export const SITE_NAMES = [
	'RAD.COM',
	'RHEA.COM',
	'MY.COM',
	'DIGITAL HAUL',
	'DATA HAUL',
	'DATA HAUL.COM',
	'CONSUMER HAUL',
	'2D HAUL',
	'SCRAPBOOKING',
	'BRAPSCOOKING',
	'SCRAPCOOKING',
	'scraPCooking',
	'PConWeb',
	'PERSONALCOMPUTER.',
	'MYPC',
	'SCRAPSITE',
	"RHEA'S REPO",
	'FINDERS, KEEPERS',
	'RHEA GPT',
	'RHEA WIKI',
	'MY SITE',
	'MY SPACE',
	'MY 2D LIFE',
	'RHEA.WWW.COM',
	'STORAGE LOCKER',
	'LETTING YOU IN',
	'MYPOOL',
	'LINKS',
	'TRAVERSE',
	'MY TRAVERSAL',
	'RHEASRECORDS',
	'STASH'
];

export const SITE_TAGLINE = 'a public personal archive — essays, research, sketches, songs';
export const SITE_AUTHOR = 'Rhea Madhogarhia';

/** Pick a name for this visit (stable within a session). */
export function siteName() {
	if (typeof sessionStorage !== 'undefined') {
		const saved = sessionStorage.getItem('siteName');
		if (saved && SITE_NAMES.includes(saved)) return saved;
		const pick = SITE_NAMES[Math.floor(Math.random() * SITE_NAMES.length)];
		try { sessionStorage.setItem('siteName', pick); } catch {}
		return pick;
	}
	return SITE_NAMES[0];
}
