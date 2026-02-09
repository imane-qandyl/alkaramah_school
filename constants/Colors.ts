/**
 * TeachSmart - Professional Autism-Friendly Color System
 * Designed for educational environments with calm, accessible colors
 * Optimized for reduced sensory overload and high contrast accessibility
 */

// Primary brand colors - professional and calming
const primaryNavy = '#2C3E50';      // Deep navy blue - main brand color
const primaryTeal = '#5DADE2';      // Muted teal - secondary accent
const accentSage = '#7FB8A3';       // Soft sage green - gentle accent

// Neutral palette - calming and highly accessible
const neutralOffWhite = '#FAFBFC';  // Off-white background
const neutralLightGray = '#F4F6F8'; // Light gray surfaces
const neutralMedGray = '#8B9DC3';   // Medium gray secondary text
const neutralDarkGray = '#34495E';  // Dark gray primary text
const neutralBorder = '#E1E8ED';    // Subtle borders and dividers

// Semantic colors - muted and professional
const successGreen = '#27AE60';     // Success states (muted)
const warningAmber = '#E67E22';     // Warning states (softer)
const errorCoral = '#E74C3C';       // Error states (professional)
const infoBlue = '#3498DB';         // Information states

// Support level colors - clear but not overwhelming
const supportLow = '#A8E6CF';       // Light sage green
const supportMedium = '#FFE4B5';    // Soft cream yellow
const supportHigh = '#F8D7DA';      // Light coral pink

export const Colors = {
  light: {
    // Core theme colors
    text: neutralDarkGray,
    textSecondary: neutralMedGray,
    background: neutralOffWhite,
    surface: '#FFFFFF',
    surfaceSecondary: neutralLightGray,
    
    // Brand colors
    primary: primaryNavy,
    primaryLight: '#34495E',
    secondary: primaryTeal,
    accent: accentSage,
    
    // Navigation and tabs
    tint: primaryNavy,
    tabBackground: '#FFFFFF',
    tabBorder: neutralBorder,
    tabIconDefault: neutralMedGray,
    tabIconSelected: primaryNavy,
    icon: neutralMedGray,
    
    // Interactive elements
    buttonPrimary: primaryNavy,
    buttonSecondary: neutralLightGray,
    buttonText: '#FFFFFF',
    buttonTextSecondary: neutralDarkGray,
    
    // Borders and dividers
    border: neutralBorder,
    borderLight: '#F0F3F7',
    
    // Semantic colors
    success: successGreen,
    warning: warningAmber,
    error: errorCoral,
    info: infoBlue,
    
    // Support levels
    supportLow: supportLow,
    supportMedium: supportMedium,
    supportHigh: supportHigh,
    
    // Card and component backgrounds
    cardBackground: '#FFFFFF',
    cardShadow: 'rgba(44, 62, 80, 0.08)',
    
    // Input fields
    inputBackground: neutralLightGray,
    inputBorder: neutralBorder,
    inputFocus: primaryTeal,
    
    // Status indicators
    online: successGreen,
    offline: neutralMedGray,
  },
  dark: {
    // Core theme colors (maintaining accessibility in dark mode)
    text: '#E8EAF0',
    textSecondary: '#A0A8B8',
    background: '#1A1D23',
    surface: '#252A32',
    surfaceSecondary: '#2C3340',
    
    // Brand colors (adjusted for dark mode)
    primary: primaryTeal,
    primaryLight: '#7FB8E5',
    secondary: accentSage,
    accent: '#A8E6CF',
    
    // Navigation and tabs
    tint: primaryTeal,
    tabBackground: '#252A32',
    tabBorder: '#3A4048',
    tabIconDefault: '#A0A8B8',
    tabIconSelected: primaryTeal,
    icon: '#A0A8B8',
    
    // Interactive elements
    buttonPrimary: primaryTeal,
    buttonSecondary: '#3A4048',
    buttonText: '#1A1D23',
    buttonTextSecondary: '#E8EAF0',
    
    // Borders and dividers
    border: '#3A4048',
    borderLight: '#2C3340',
    
    // Semantic colors (adjusted for dark mode)
    success: '#2ECC71',
    warning: '#F1C40F',
    error: '#E67E22',
    info: '#3498DB',
    
    // Support levels (darker variants)
    supportLow: '#27AE60',
    supportMedium: '#F39C12',
    supportHigh: '#E74C3C',
    
    // Card and component backgrounds
    cardBackground: '#252A32',
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    
    // Input fields
    inputBackground: '#2C3340',
    inputBorder: '#3A4048',
    inputFocus: accentSage,
    
    // Status indicators
    online: '#2ECC71',
    offline: '#A0A8B8',
  },
};
