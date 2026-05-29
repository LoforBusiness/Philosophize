/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF7',
        ink: '#1A1A1A',
        'ink-soft': '#6B6B6B',
        'ink-faint': '#E8E8E3',
        'sketch-blue': '#3B6FE8',
        'sketch-blue-fill': '#EEF2FD',
        'sketch-green': '#3D7A55',
        'sketch-green-fill': '#EAF3EE',
        'sketch-red': '#A83232',
        'sketch-red-fill': '#F7EAEA',
        // Legacy (kept for compatibility)
        midnight: '#1A1A1A',
        navy: '#F0EFEA',
        gold: '#1A1A1A',
        sage: '#3D7A55',
        parchment: '#FAFAF7',
        crimson: '#A83232',
        'navy-light': '#E8E8E3',
        'gold-light': '#333333',
        'sage-light': '#4A9B6A',
        'midnight-soft': '#1A1A1A',
      },
      fontFamily: {
        caveat: ['Caveat_700Bold'],
        'caveat-regular': ['Caveat_400Regular'],
        serif: ['PlayfairDisplay_700Bold'],
        'serif-regular': ['PlayfairDisplay_400Regular'],
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
