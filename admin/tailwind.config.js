/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Admin dark theme colors
        admin: {
          bg: '#0a0e1a',
          surface: '#0f1419',
          card: '#16191f',
          border: '#1f2937',
          hover: '#1e2430',
          text: '#e2e8f0',
          muted: '#64748b',
        }
      }
    },
  },
  plugins: [],
}
