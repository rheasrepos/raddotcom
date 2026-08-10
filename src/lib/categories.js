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
	// ---- THE 5 DESKTOP FOLDERS (top level, no parent) ----
	research:    { id: 'research',    label: 'Research',              color: 'var(--color-research)' },
	art:         { id: 'art',         label: 'Art',                   color: '#e17055' },
	uchicago:    { id: 'uchicago',    label: 'University of Chicago', color: '#800000' }, // UChicago maroon
	writing:     { id: 'writing',     label: 'Personal Writing',      color: 'var(--color-writing)' },
	programming: { id: 'programming', label: 'Projects',              color: 'var(--color-programming)' },

	// ---- ART (visual art loose inside; creative work nested) ----
	creative:  { id: 'creative',  label: 'Creative',          color: '#e17055',             parent: 'art' },
	comedy:    { id: 'comedy',    label: 'Comedy',            color: 'var(--color-comedy)', parent: 'creative' },
	music:     { id: 'music',     label: 'Music',             color: 'var(--color-music)',  parent: 'creative' },
	// the img* scans of kept things (the hoard) live here inside Art
	artifacts: { id: 'artifacts', label: 'Collected & Kept',  color: '#b26b3f',             parent: 'art' },

	// ---- UNIVERSITY OF CHICAGO (coursework + academic essays, by course) ----
	coursework: { id: 'coursework', label: 'Coursework',      color: '#78909c', parent: 'uchicago' },
	essays:     { id: 'essays',     label: 'Essays & Papers', color: '#4a69bd', parent: 'uchicago' },

	// ---- PERSONAL WRITING (opinions/think-pieces at top; notes & scraps) ----
	thesis:  { id: 'thesis',  label: 'Thesis Notes',        color: '#8e44ad', parent: 'writing' },
	recs:    { id: 'recs',    label: 'Recommendations',     color: '#00b894', parent: 'writing' },
	friends: { id: 'friends', label: 'Field Notes on Rhea', color: '#fd79a8', parent: 'writing' }
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
