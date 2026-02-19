import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF5E18",
          light: "#FF8A57", // lighter orange
          dark: "#CC4A12", // darker orange
        },
        secondary: {
          DEFAULT: "#FF9A6C", // soft peach-orange (complementary)
          light: "#FFBFA0", // lighter peach
          dark: "#E07040", // deeper warm tone
        },
        tealish: {
          DEFAULT: "#308e87",
          light: "#4fb0aa",
          dark: "#23635f",
        },
        accent: "#F59E0B",
        background: "#F9FAFB",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
