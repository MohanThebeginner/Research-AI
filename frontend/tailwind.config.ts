import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5F7F6",
        ink: "#191B1A",
        muted: "#5B6461",
        border: "#DCE3DF",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#0F6B5C",
          hover: "#0B5548",
          soft: "#E4F0EC",
        },
        accent: {
          DEFAULT: "#C98A1E",
          soft: "#FBF0DC",
        },
        danger: {
          DEFAULT: "#B3392C",
          soft: "#FBEAE7",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
