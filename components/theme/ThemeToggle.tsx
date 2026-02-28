"use client";

import * as React from "react";

type Theme = "dark" | "light";

function getTheme(): Theme {
  try {
    const v = localStorage.getItem("kx_theme_v2");
    if (v === "light" || v === "dark") return v;
  } catch {}
  return "dark";
}

function applyTheme(theme: Theme) {
  try {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    localStorage.setItem("kx_theme_v2", theme);
  } catch {}
}

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>("dark");

  React.useEffect(() => {
    const t = getTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="h-10 w-10 rounded-xl border border-kx-border/15 bg-kx-surface/70 text-kx-muted transition hover:bg-kx-surface/90 hover:text-kx-fg"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12.8A8.5 8.5 0 0 1 11.2 3a7.2 7.2 0 1 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.9"
          />
        </svg>
      ) : (
        <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <path
            d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.55"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
