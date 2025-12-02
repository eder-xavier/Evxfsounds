// Colors and Theme Constants for Evxf Sounds
export const COLORS = {
  // Light Theme
  light: {
    primary: '#2c4b7dff',      // Indigo
    secondary: '#06B6D4',    // Cyan/Blue
    accent: '#10B981',       // Green
    background: '#F9FAFB',   // Light Gray
    surface: '#FFFFFF',      // White
    card: '#FFFFFF',
    text: '#2c4b7dff',         // Dark Gray
    textSecondary: '#6B7280', // Gray
    border: '#E5E7EB',       // Light Border
    error: '#EF4444',        // Red
    success: '#10B981',      // Green
    warning: '#F59E0B',      // Amber
    playerBg: '#FFFFFF',
    playerControls: '#2c4b7dff',
    progressBar: '#2c4b7dff',
    progressBg: '#E5E7EB',
    tabBar: '#FFFFFF',
    tabBarActive: '#2c4b7dff',
    tabBarInactive: '#9CA3AF',
  },

  // Dark Theme
  dark: {
    primary: '#568CAD',      // Lighter Indigo
    secondary: '#22D3EE',    // Lighter Cyan
    accent: '#34D399',       // Lighter Green
    background: '#0F172A',   // Dark Blue Gray
    surface: '#1E293B',      // Slate
    card: '#1E293B',
    text: '#F9FAFB',         // Light
    textSecondary: '#94A3B8', // Slate Gray
    border: '#334155',       // Dark Border
    error: '#F87171',        // Light Red
    success: '#34D399',      // Light Green
    warning: '#FBBF24',      // Light Amber
    playerBg: '#1E293B',
    playerControls: '#568CAD',
    progressBar: '#568CAD',
    progressBg: '#334155',
    tabBar: '#1E293B',
    tabBarActive: '#568CAD',
    tabBarInactive: '#64748B',
  }
};

// Gradient combinations
export const GRADIENTS = {
  light: {
    primary: ['#6366F1', '#4F46E5', '#4338CA'],
    secondary: ['#22D3EE', '#06B6D4', '#0891B2'],
    accent: ['#34D399', '#10B981', '#059669'],
    mixed: ['#4F46E5', '#06B6D4', '#10B981'],
  },
  dark: {
    primary: ['#818CF8', '#6366F1', '#4F46E5'],
    secondary: ['#67E8F9', '#22D3EE', '#06B6D4'],
    accent: ['#6EE7B7', '#34D399', '#10B981'],
    mixed: ['#6366F1', '#22D3EE', '#34D399'],
  }
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  semibold: 'System',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

// Border Radius
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
