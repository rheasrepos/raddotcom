// One place to rename the site — everything reads from here.

// Official name. (The rotating-title experiment is kept below but switched off;
// set ROTATE = true and it cycles through SITE_NAMES again.)
export const SITE_NAME = 'WWW.RHEA.COM';
export const ROTATE = false;

export const SITE_NAMES = [
	'RHEA.COM',
	'RAD.COM',
	'MY.COM',
	'DIGITAL HAUL',
	'DATA HAUL',
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

export const SITE_TAGLINE = 'a public personal archive — my digital media';
export const SITE_AUTHOR = 'Rhea Madhogarhia';

/** The site's name. Rotates only if ROTATE is turned on. */
export function siteName() {
	if (!ROTATE) return SITE_NAME;
	if (typeof sessionStorage !== 'undefined') {
		const saved = sessionStorage.getItem('siteName');
		if (saved && SITE_NAMES.includes(saved)) return saved;
		const pick = SITE_NAMES[Math.floor(Math.random() * SITE_NAMES.length)];
		try { sessionStorage.setItem('siteName', pick); } catch {}
		return pick;
	}
	return SITE_NAME;
}
