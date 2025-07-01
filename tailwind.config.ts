/** @format */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      blue: "#1fb6ff",
      dark: "#000",
      "dark-fade": "rgba(0,0,0,0.8)",
      salmon: "salmon",
      transparent: "transparent",
      white: "#fff",
      "white-fade": "rgba(255,255,255,0.7)",
      purple: "rgb(70, 66, 255)",
    },
    fontFamily: {
      primary: ["Montserrat", "sans-serif"],
      highlight: ["Monument Extended", "sans-serif"],
    },
    animation: {
      "spin-slow": "spin 20s linear infinite",
    },
    keyframes: {
      spin: {
        "0%, ": { rotate: "0deg" },
        "50%": { scale: "1.15" },
        "100%": { rotate: "360deg" },
      },
    },
    extend: {
      spacing: {
        "w-screen": "100dvw",
        "h-half": "50dvh",
      },
      backgroundImage: {
        "purple-gradient":
          "linear-gradient(128deg, rgba(70,66,255,1) 32%, rgba(255,0,219,1) 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
