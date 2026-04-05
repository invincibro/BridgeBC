/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F28C38',
        secondary: '#6BBF73',
        accent: '#F6C445',
        background: '#F5EDE4',
        'text-primary': '#2F3E46',
        'text-secondary': '#6B7280',
        sand: '#f6f2ea',
        pine: '#2F3E46',
        moss: '#6BBF73',
        ember: '#F28C38',
        sky: '#dcefe1',
      },
      boxShadow: {
        panel: '0 16px 36px rgba(86, 70, 48, 0.10)',
        soft: '0 10px 24px rgba(86, 70, 48, 0.08)',
      },
      fontFamily: {
        sans: ['"Open Sans"', '"Segoe UI"', 'sans-serif'],
        serif: ['"Poppins"', '"Open Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
