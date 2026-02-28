import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kryvexis design tokens (RGB triplets stored in CSS variables)
        kx: {
          bg: "rgb(var(--kx-bg) / <alpha-value>)",
          shell: "rgb(var(--kx-shell) / <alpha-value>)",
          surface: "rgb(var(--kx-surface) / <alpha-value>)",
          "surface-2": "rgb(var(--kx-surface-2) / <alpha-value>)",
          fg: "rgb(var(--kx-fg) / <alpha-value>)",
          muted: "rgb(var(--kx-muted) / <alpha-value>)",
          border: "rgb(var(--kx-border) / <alpha-value>)",
          accent: "rgb(var(--kx-accent) / <alpha-value>)",
        },
      },
      boxShadow: {
        "kx": "var(--kx-shadow)",
        "kx-2": "var(--kx-shadow-2)",
      },
    },
  },
  plugins: [],
} satisfies Config;
