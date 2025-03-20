/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "#ffffff",
        background: "#f4f4f4",
        primary: "#0183ff",
        black: "#252424",
      },
    },
  },
  plugins: [],
};
