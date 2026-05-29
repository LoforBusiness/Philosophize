export const Colors = {
  paper: '#FAFAF7',
  ink: '#1A1A1A',
  inkSoft: '#6B6B6B',
  inkFaint: '#E8E8E3',
  blue: '#3B6FE8',
  blueFill: '#EEF2FD',
  green: '#3D7A55',
  greenFill: '#EAF3EE',
  red: '#A83232',
  redFill: '#F7EAEA',
  // Legacy aliases for any code that still uses old names
  parchment: '#FAFAF7',
  midnight: '#1A1A1A',
  navy: '#F0EFEA',
  navyLight: '#E8E8E3',
  gold: '#1A1A1A',
  sage: '#3D7A55',
  sageLight: '#4A9B6A',
  crimson: '#A83232',
  midnightSoft: '#1A1A1A',
  white: '#FAFAF7',
  gray100: '#F0EFEA',
  gray300: '#E8E8E3',
  gray500: '#6B6B6B',
  gray700: '#333333',
};

export const BranchColors: Record<string, string> = {
  logic: '#1A1A1A',
  ethics: '#1A1A1A',
  epistemology: '#1A1A1A',
  metaphysics: '#1A1A1A',
  aesthetics: '#1A1A1A',
  'political-philosophy': '#1A1A1A',
};

export default {
  light: {
    text: Colors.ink,
    background: Colors.paper,
    tint: Colors.ink,
    tabIconDefault: Colors.inkSoft,
    tabIconSelected: Colors.ink,
  },
  dark: {
    text: Colors.ink,
    background: Colors.paper,
    tint: Colors.ink,
    tabIconDefault: Colors.inkSoft,
    tabIconSelected: Colors.ink,
  },
};
