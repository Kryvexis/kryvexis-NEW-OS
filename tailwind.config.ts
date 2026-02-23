import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./styles/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kx: {
          bg: "#070A12",
          panel: "rgba(255,255,255,0.06)",
          line: "rgba(255,255,255,0.10)",
          text: "rgba(255,255,255,0.92)",
          muted: "rgba(255,255,255,0.68)",
          accent: "#22d3ee",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;