// Centralized theme configuration
// Change colors here and they update everywhere!

export const theme = {
  colors: {
    // Primary colors
    primary: '#ff8c42',        // Main orange background
    secondary: '#333333',      // Dark borders and text
    accent: '#4ecdc4',         // Teal accent color
    
    // Text colors
    text: '#000000',           // Black text
    textLight: '#ffffff',      // White text
    textMuted: '#666666',      // Gray text
    
    // Background colors
    background: '#ffffff',     // White backgrounds
    backgroundLight: '#f9f9f9', // Light gray backgrounds
    
    // Status colors
    success: '#2ecc71',        // Green for success
    error: '#e74c3c',          // Red for errors
    warning: '#f39c12',        // Orange for warnings
    
    // Category colors (from your categories.js)
    writing: '#4ecdc4',
    programming: '#45b7d1', 
    music: '#96ceb4',
    comedy: '#feca57',
    art: '#9b59b6'
  },
  
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.9rem', 
      base: '1rem',
      lg: '1.1rem',
      xl: '1.5rem',
      xxl: '2.5rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem', 
    lg: '2rem',
    xl: '2.5rem',
    xxl: '3rem'
  },
  
  borders: {
    width: '2px',
    style: 'solid',
    color: '#333333',
    radius: '0'  // No rounded corners for your aesthetic
  },
  
  shadows: {
    none: 'none',
    subtle: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.15)'
  },
  
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  },
  
  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease'
  }
};

// Helper functions
export function getColor(colorName) {
  return theme.colors[colorName] || colorName;
}

export function getSpacing(size) {
  return theme.spacing[size] || size;
}

export function getFontSize(size) {
  return theme.typography.fontSize[size] || size;
} 