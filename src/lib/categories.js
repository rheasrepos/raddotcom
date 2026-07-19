// Centralized category configuration
export const categoryConfig = {
	writing: { id: 'writing', label: 'Notes & Writing', color: 'var(--color-writing)' },
	essays: { id: 'essays', label: 'Essays & Papers', color: '#4a69bd' }, // academic essays & term papers
	thesis: { id: 'thesis', label: 'Thesis Notes', color: '#8e44ad' }, // Added this new category
	research: { id: 'research', label: 'Research', color: 'var(--color-research)' },
	programming: { id: 'programming', label: 'Tech & Industry', color: 'var(--color-programming)' },
	creative: { id: 'creative', label: 'Creative', color: '#e17055' }, // poems, songs, scripts, radio
	comedy: { id: 'comedy', label: 'Comedy', color: 'var(--color-comedy)' },
	music: { id: 'music', label: 'Music', color: 'var(--color-music)' },
	recs: { id: 'recs', label: 'Recommendations', color: '#00b894' } // books, music, places, food
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