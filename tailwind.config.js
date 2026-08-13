/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f0f11',
        'dark-panel': '#1a1a1f',
        'neon-green': '#00ff88',
        'neon-red': '#ff3366',
        'neon-blue': '#00ccff',
      },
      boxShadow: {
        'neon-green': '0 0 10px rgba(0, 255, 136, 0.5)',
        'neon-red': '0 0 10px rgba(255, 51, 102, 0.5)',
        'neon-blue': '0 0 10px rgba(0, 204, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
