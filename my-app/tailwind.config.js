/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#29a38f",
        "background-light": "#fafaf9",
        "background-dark": "#1a1c1e",
        "surface-dark": "#21262c",
        "gray-100": "#f3f4f6", // Default tailwind, but ensuring availability
        "gray-800": "#1f2937",
      },
      fontFamily: {
        display: ["System", "sans-serif"],
      },
    },
  },
  plugins: [],
};
