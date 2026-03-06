import type { Config } from "tailwindcss";

export default {
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
          surface3: "rgb(var(--kx-surface-3) / <alpha-value>)",
          fg: "rgb(var(--kx-fg) / <alpha-value>)",
          muted: "rgb(var(--kx-muted) / <alpha-value>)",
          border: "rgb(var(--kx-border) / <alpha-value>)",
          accent: "rgb(var(--kx-accent) / <alpha-value>)",
          accent2: "rgb(var(--kx-accent-2) / <alpha-value>)",
          success: "rgb(var(--kx-success) / <alpha-value>)",
          warning: "rgb(var(--kx-warning) / <alpha-value>)",
          danger: "rgb(var(--kx-danger) / <alpha-value>)",
          info: "rgb(var(--kx-info) / <alpha-value>)",
        },
      },
      borderRadius: {
        kx: "12px",
        kxlg: "16px",
      },
      boxShadow: {
        "kx-card": "var(--kx-shadow-card)",
        "kx-float": "var(--kx-shadow-float)",
      },
    },
  },
  plugins: [],
} satisfies Config;
