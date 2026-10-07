/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./*.{js,ts,jsx,tsx,html}", // Catches files if they are in root instead of src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}