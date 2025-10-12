/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'grid-pattern': `repeating-linear-gradient(
          to right,
          #cbd5e1 0px,
          #cbd5e1 2px,
          transparent 2px,
          transparent 40px
        ),
        repeating-linear-gradient(
          to bottom,
          #cbd5e1 0px,
          #cbd5e1 2px,
          transparent 2px,
          transparent 40px
        )`,
      },
    },
  },
  plugins: [],
}
