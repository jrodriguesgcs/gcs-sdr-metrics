/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'night-blue': {
          DEFAULT: '#000957',
          50: '#b3b5cd',
          100: '#8084ab',
          200: '#333a79',
          300: '#1a2268',
          500: '#00084e',
          600: '#000746',
          700: '#000534',
          800: '#00052c',
          900: '#00031a',
        },
        'electric-blue': {
          DEFAULT: '#3f8cff',
          20: '#ecf4ff',
          50: '#c4d9ff',
          100: '#b2d1ff',
          200: '#8cbaff',
          300: '#65a3ff',
          500: '#3270cc',
          600: '#2c62b3',
          700: '#265499',
          800: '#193866',
          900: '#132a4c',
        },
        'dark-blue': '#07101f',
        'ice-white': '#e8ebf0',
      },
    },
  },
  plugins: [],
}