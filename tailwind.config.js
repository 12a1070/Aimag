/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // ここが間違っているとデザインが反映されません
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
