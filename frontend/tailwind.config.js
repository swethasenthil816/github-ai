/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fb',
          100: '#e8eff7',
          200: '#cbdced',
          300: '#9dbfdd',
          400: '#689bc9',
          500: '#477db1',
          600: '#366292',
          700: '#2d5077',
          800: '#274463',
          900: '#243b54',
          950: '#182637',
        },
        accent: {
          cyan: '#06b6d4',
          indigo: '#6366f1',
          pink: '#ec4899',
          amber: '#f59e0b',
          emerald: '#10b981'
        },
        dark: {
          bg: '#070a13',
          card: '#111827',
          cardMuted: '#1f2937',
          border: '#374151',
          text: '#f9fafb',
          muted: '#9ca3af'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
