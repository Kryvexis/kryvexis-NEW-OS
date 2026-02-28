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
        kx: {
          bg: "rgb(var(--kx-bg) / <alpha-value>)",
          shell: "rgb(var(--kx-shell) / <alpha-value>)",
          surface: "rgb(var(--kx-surface) / <alpha-value>)",
          surface2: "rgb(var(--kx-surface-2) / <alpha-value>)",
          surface3: "rgb(var(--kx-surface-3) / <alpha-value>)",
          fg: "rgb(var(--kx-fg) / <alpha-value>)",
          muted: "rgb(var(--kx-muted) / <alpha-value>)",
          border: "rgb(var(--kx-border) / <alpha-value>)",
          accent: "rgb(var(--kx-accent) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
