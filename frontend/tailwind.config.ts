import type { Config } from 'tailwindcss'

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006EC7',
          dark: '#004F8F',
          light: '#EBF3FA',
          'dark-mode': '#4DA3E0',
        },
        gray: {
          50: '#FAF9F7',
          100: '#F0EEEB',
          200: '#E0DCD8',
          300: '#C8C2BC',
          400: '#A89F97',
          500: '#887D75',
          600: '#706661',
          700: '#574F4A',
          800: '#3D3734',
          900: '#252220',
          950: '#171514',
        },
        accent: {
          turquoise: '#28DCAA',
          yellow: '#FFFF00',
          orange: '#FF9868',
          pink: '#F566BA',
          violet: '#461EBE',
          green: '#76C800',
        },
        success: '#28A745',
        warning: '#FFC107',
        error: '#CC3333',
        info: '#17A2B8',
      },
      fontFamily: {
        sans: ['Fira Sans', 'sans-serif'],
        condensed: ['Fira Sans Condensed', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'modal': '0 20px 60px -15px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config
