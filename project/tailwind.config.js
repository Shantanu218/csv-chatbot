/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6ECF5',
          100: '#C3D0E9',
          200: '#9CB0DD',
          300: '#748FD0',
          400: '#5876C6',
          500: '#3B62BC',
          600: '#2F4F96',
          700: '#243C71',
          800: '#18294B',
          900: '#0C1526',
          950: '#0A2463',
        },
        secondary: {
          50: '#E6F5F8',
          100: '#CCE9F0',
          200: '#99D3E1',
          300: '#66BDD2',
          400: '#33A7C3',
          500: '#147D9D',
          600: '#10647D',
          700: '#0C4B5E',
          800: '#08323E',
          900: '#04191F',
        },
        accent: {
          50: '#FFF4E6',
          100: '#FFE8CC',
          200: '#FFD199',
          300: '#FFBA66',
          400: '#FFA833',
          500: '#FF9505',
          600: '#CC7700',
          700: '#995A00',
          800: '#663C00',
          900: '#331E00',
        },
        success: {
          500: '#10B981',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      }
    },
  },
  plugins: [],
};