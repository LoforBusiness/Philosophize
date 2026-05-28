// Philosophy color palette
export const Colors = {
  midnight: '#0F1B2D',
  navy: '#1A2F4A',
  navyLight: '#243D5C',
  gold: '#C9A84C',
  goldLight: '#E8C96A',
  sage: '#4A7B6F',
  sageLight: '#5D9B8C',
  parchment: '#F5F0E8',
  crimson: '#8B2635',
  midnightSoft: '#172336',
  white: '#FFFFFF',
  gray100: '#F5F5F5',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
};

export const BranchColors: Record<string, string> = {
  logic: '#4A7B9D',
  ethics: '#7B4A9D',
  epistemology: '#9D7B4A',
  metaphysics: '#4A9D7B',
  aesthetics: '#9D4A7B',
  'political-philosophy': '#7B9D4A',
};

// Legacy shape kept for expo-router template compatibility
export default {
  light: {
    text: Colors.midnight,
    background: Colors.parchment,
    tint: Colors.gold,
    tabIconDefault: Colors.gray500,
    tabIconSelected: Colors.gold,
  },
  dark: {
    text: Colors.parchment,
    background: Colors.midnight,
    tint: Colors.gold,
    tabIconDefault: Colors.gray500,
    tabIconSelected: Colors.gold,
  },
};
