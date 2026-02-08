/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme backgrounds
        dark: {
          DEFAULT: '#000000',
          lighter: '#0a0a0a',
          card: '#1a1a1a',
          panel: '#262626',
        },
        // Lemon/Gold accent colors
        lemon: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          DEFAULT: '#F4E04D', // Primary lemon
          500: '#F4E04D',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE55C',
          dark: '#CCA300',
        },
        // Text colors
        text: {
          primary: '#ffffff',
          secondary: '#d1d5db',
          tertiary: '#9ca3af',
          muted: '#6b7280',
        },
        // Keep success and error states
        success: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626',
        },
      },
    },
  },
  plugins: [],
}
