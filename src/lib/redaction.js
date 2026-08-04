// ────────────────────────────────────────────────────────────────────
// REDACTION AGE-DECAY — the older a post, the more degraded its text.
// Uses the Redaction typeface (redaction.us), which ships in "grades":
// Redaction (clean) → 10 → 20 → 35 → 50 → 70 → 100 (most degraded).
//
// TUNE ME: edit the table below. Each row means "if the post is at
// least this many months old, use this grade". Rows must go oldest-last.
// Set APPLY_TO_BODY = false if you only want titles to decay.
//
// The fonts must live in static/fonts/redaction/ (see HOW TO doc §10b).
// Until the files exist, everything silently falls back to SF Mono.
// ────────────────────────────────────────────────────────────────────

export const REDACTION_STEPS = [
	{ months: 6,   grade: 'R'   }, // ≥ 6 months old → clean Redaction
	{ months: 12,  grade: '10'  }, // ≥ 1 year
	{ months: 24,  grade: '20'  }, // ≥ 2 years
	{ months: 48,  grade: '35'  }, // ≥ 4 years
	{ months: 72,  grade: '50'  }, // ≥ 6 years
	{ months: 96,  grade: '70'  }, // ≥ 8 years
	{ months: 120, grade: '100' }  // ≥ 10 years → maximum decay
];

export const APPLY_TO_BODY = true; // false = titles only

// Months between a date and now (fractional).
function monthsOld(dateStr) {
	const d = new Date(dateStr);
	if (isNaN(d)) return 0;
	return (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
}

// Returns a CSS class like 'redact-20', or '' for posts newer than the
// first threshold (they keep the normal site font).
export function redactionClass(dateStr) {
	if (!dateStr) return '';
	const age = monthsOld(dateStr);
	let cls = '';
	for (const step of REDACTION_STEPS) {
		if (age >= step.months) cls = `redact-${step.grade}`;
	}
	return cls;
}
