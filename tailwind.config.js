/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Arial', 'sans-serif'],
        display: ['Kanit', 'Cairo', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#111111',
        soft: '#1B1B1B',
        paper: '#F4F1EA',
        fog: '#E4DFD6',
        line: '#C9C6C0',
      },
      letterSpacing: {
        editorial: '0.22em',
      },
      boxShadow: {
        editorial: '0 24px 70px rgba(17, 17, 17, 0.11)',
      },
    },
  },
  plugins: [],
};
