/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Arial', 'sans-serif'],
        display: ['Kanit', 'Cairo', 'sans-serif'],
      },
      colors: {
        ink: '#111111',
        soft: '#1B1B1B',
        paper: '#F2F0EB',
        fog: '#D9D6D0',
        line: '#C9C6C0',
      },
      letterSpacing: {
        editorial: '0.18em',
      },
      boxShadow: {
        editorial: '0 24px 70px rgba(17, 17, 17, 0.11)',
      },
    },
  },
  plugins: [],
};
