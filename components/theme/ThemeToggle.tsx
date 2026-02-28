"use client";

import * as React from "react";

function getTheme(): "dark" | "light" {
  try {
    const v = localStorage.getItem("kx_theme");
    if (v === "light" || v === "dark") return v;
  } catch {}
  return "dark";
}

function applyTheme(theme: "dark" | "light") {
  try {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("kx-light", theme === "light");
    localStorage.setItem("kx_theme", theme);
  } catch {}
}

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<"dark" | "light">("dark");

  React.useEffect(() => {
    const t = getTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="h-10 w-10 rounded-xl border border-[rgba(var(--kx-fg),.12)] bg-[rgba(var(--kx-fg),.05)] text-[rgba(var(--kx-fg),.70)] transition hover:bg-[rgba(var(--kx-fg),.10)] hover:text-[rgba(var(--kx-fg),.92)]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12.8A8.5 8.5 0 0 1 11.2 3a7.2 7.2 0 1 0 9.8 9.8Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      ) : (
        <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" stroke="currentColor" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
