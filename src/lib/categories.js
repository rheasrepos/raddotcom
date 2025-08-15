// Centralized category configuration
export const categoryConfig = {
	writing: { id: 'writing', label: 'Notes App', color: 'var(--color-writing)' },
	programming: { id: 'programming', label: 'Programming', color: 'var(--color-programming)' },
	music: { id: 'music', label: 'Music', color: 'var(--color-music)' },
	comedy: { id: 'comedy', label: 'Comedy', color: 'var(--color-comedy)' },
	art: { id: 'art', label: 'Art', color: 'var(--color-art)' }
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