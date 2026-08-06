// Centralized category configuration.
//
// TWO LAYERS:
//  - GROUPS (no `parent`) are the big desktop folders. There are 4.
//  - CATEGORIES (`parent: <group>`) are the real `type:` values on posts;
//    they show up as folders INSIDE their group.
// A category can itself nest (Comedy/Music live inside Creative, which lives
// inside Making). To move a category into a different group, change its
// `parent`. To rename a group, change its `label`.
export const categoryConfig = {
	// ---- GROUPS (the 4 desktop folders) ----
	'grp-writing':    { id: 'grp-writing',    label: 'Writing',     color: '#4a69bd', group: true },
	'grp-making':     { id: 'grp-making',     label: 'Making',      color: '#e17055', group: true },
	'grp-collecting': { id: 'grp-collecting', label: 'Collecting',  color: '#00b894', group: true },

	// ---- WRITING ----
	writing:   { id: 'writing',   label: 'Notes & Writing',  color: 'var(--color-writing)', parent: 'grp-writing' },
	essays:    { id: 'essays',    label: 'Essays & Papers',  color: '#4a69bd',              parent: 'grp-writing' },
	coursework:{ id: 'coursework',label: 'Coursework',       color: '#78909c',              parent: 'grp-writing' },
	thesis:    { id: 'thesis',    label: 'Thesis Notes',     color: '#8e44ad',              parent: 'grp-writing' },

	// ---- RESEARCH ----
	// Research is its own top-level folder (no group wrapper) — it goes
	// straight to its subfolders (cab-lab, coursework-research, …), so there's
	// no redundant "Research / Research" nesting.
	research:  { id: 'research',  label: 'Research',         color: 'var(--color-research)' },

	// ---- MAKING ----
	creative:    { id: 'creative',    label: 'Creative',       color: '#e17055',                  parent: 'grp-making' },
	comedy:      { id: 'comedy',      label: 'Comedy',         color: 'var(--color-comedy)',      parent: 'creative' },
	music:       { id: 'music',       label: 'Music',          color: 'var(--color-music)',       parent: 'creative' },
	programming: { id: 'programming', label: 'Tech & Industry',color: 'var(--color-programming)', parent: 'grp-making' },

	// ---- COLLECTING ----
	recs:      { id: 'recs',      label: 'Recommendations',      color: '#00b894', parent: 'grp-collecting' },
	friends:   { id: 'friends',   label: 'Field Notes on Rhea',  color: '#fd79a8', parent: 'grp-collecting' },
	artifacts: { id: 'artifacts', label: 'Analog Archive',       color: '#b26b3f', parent: 'grp-collecting' }
};

// Helper function to get category display name
export function getCategoryLabel(categoryId) {
	return categoryConfig[categoryId] ? categoryConfig[categoryId].label : categoryId;
}

// Helper function to get category color
export function getCategoryColor(categoryId) {
	return categoryConfig[categoryId] ? categoryConfig[categoryId].color : '#636e72';
}

// Get all category IDs
export function getCategoryIds() {
	return Object.keys(categoryConfig);
}

// Get all category objects for dropdowns/selects
export function getCategoryOptions() {
	return Object.values(categoryConfig);
}
