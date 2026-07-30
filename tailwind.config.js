/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5fb',
          100: '#d7e8f5',
          200: '#b0d0eb',
          300: '#7fb1dc',
          400: '#4a8dc9',
          500: '#2870ac',
          600: '#1c568a',
          700: '#18456e',
          800: '#163a5b',
          900: '#13314c',
        },
        accent: {
          500: '#c0392b',
          600: '#a5301f',
        },
      },
      fontFamily: {
        sans: ['var(--font-tajawal)', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
