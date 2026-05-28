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
        midnight: '#0F1B2D',
        navy: '#1A2F4A',
        gold: '#C9A84C',
        sage: '#4A7B6F',
        parchment: '#F5F0E8',
        crimson: '#8B2635',
        'navy-light': '#243D5C',
        'gold-light': '#E8C96A',
        'sage-light': '#5D9B8C',
        'midnight-soft': '#172336',
      },
      fontFamily: {
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
