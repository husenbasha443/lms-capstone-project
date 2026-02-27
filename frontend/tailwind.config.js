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
        'primary': '#137fec',
        'primary-hover': '#0d6fd4',
        'primary-dark': '#0a5bb8',
        'background-light': '#f6f7f8',
        'background-dark': '#101922',
      },
      fontFamily: {
        'display': ['Lexend', 'sans-serif'],
        'sans': ['Lexend', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px',
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-in': 'slide-in 0.6s ease-out forwards',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
        'in': 'fade-in 0.2s ease-out',
        'slide-in-from-bottom-5': 'slide-in-from-bottom-5 0.3s ease-out',
        'slide-in-from-top-2': 'slide-in-from-top-2 0.2s ease-out',
        'zoom-in-95': 'zoom-in-95 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-in': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'pulse-slow': {
          '0%, 100%': {
            opacity: '0.6',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        'spin': {
          'to': {
            transform: 'rotate(360deg)',
          },
        },
        'slide-in-from-bottom-5': {
          '0%': { transform: 'translateY(1.25rem)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        'slide-in-from-top-2': {
          '0%': { transform: 'translateY(-0.5rem)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'zoom-in-95': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
