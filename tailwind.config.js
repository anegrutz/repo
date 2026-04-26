/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0f0a',
          elevated: '#141a13',
          card: '#1c241a',
        },
        leaf: {
          50: '#f0fbe9',
          400: '#7cd25a',
          500: '#5cb544',
          600: '#3d8c2c',
          700: '#2e6b22',
        },
        ember: {
          400: '#ff8a3d',
          500: '#ff6b1a',
        },
        haze: {
          200: '#c8c8c8',
          400: '#8a8a8a',
          600: '#4a4a4a',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
