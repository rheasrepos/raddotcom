// Centralized category configuration
export const categoryConfig = {
	writing: { id: 'writing', label: 'Notes App', color: '#4ecdc4' },
	programming: { id: 'programming', label: 'Programming', color: '#45b7d1' },
	music: { id: 'music', label: 'Music', color: '#96ceb4' },
	comedy: { id: 'comedy', label: 'Comedy', color: '#feca57' },
	art: { id: 'art', label: 'Art', color: '#9b59b6' }
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