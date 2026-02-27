import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", "[data-theme='dark']"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kx: {
          bg: "rgb(var(--kx-bg))",
          shell: "rgb(var(--kx-shell))",
          surface: "rgb(var(--kx-surface))",
          fg: "rgb(var(--kx-fg))",
          muted: "rgb(var(--kx-muted))",
          accent: "rgb(var(--kx-accent))",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
