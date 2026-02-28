import type { Config } from "tailwindcss";

export default {
  // Single source of truth for dark mode: the `dark` class on <html>.
  // We still set data-theme for debugging, but Tailwind uses class.
  darkMode: ["class"],
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
          fg: "rgb(var(--kx-fg) / <alpha-value>)",
          muted: "rgb(var(--kx-muted) / <alpha-value>)",
          border: "rgb(var(--kx-border) / <alpha-value>)",
          accent: "rgb(var(--kx-accent) / <alpha-value>)",
          accent2: "rgb(var(--kx-accent-2) / <alpha-value>)",
        },
      },
      borderRadius: {
        kx: "12px",
        kxlg: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
