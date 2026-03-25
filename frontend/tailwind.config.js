/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          main: '#1D5D30',    // Deep Forest Green
          light: '#E8F8EE',   // Soft Mint
          earth: '#8B5A2B',   // Earthy Brown
          accent: '#F1C40F',  // Sunshine Yellow
          dark: '#113a1d',    // Darker Green for hovers
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
