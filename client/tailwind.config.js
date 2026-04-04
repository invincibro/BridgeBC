/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#f6f2ea',
        pine: '#19362e',
        moss: '#5b7f71',
        ember: '#d97745',
        sky: '#d8ebe5',
      },
      boxShadow: {
        panel: '0 18px 40px rgba(25, 54, 46, 0.12)',
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', 'sans-serif'],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
}
