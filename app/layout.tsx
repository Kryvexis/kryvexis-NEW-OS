import "./globals.css";

const themeInitScript = `
(() => {
  try {
    // Theme (support legacy keys)
    const storedTheme = localStorage.getItem("kx_theme") || localStorage.getItem("kx-theme");
    const theme = (storedTheme === "light" || storedTheme === "dark") ? storedTheme : "dark";
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");

    // Accent (support legacy keys: rgb string or named preset)
    const storedAccentRgb = localStorage.getItem("kx-accent");
    const storedAccentName = localStorage.getItem("kx_accent");
    const map = {
      cyan: "34 211 238",
      blue: "59 130 246",
      purple: "168 85 247",
      green: "34 197 94",
      orange: "249 115 22",
    };
    const rgb = storedAccentRgb || (storedAccentName ? (map[storedAccentName] || map.cyan) : map.cyan);
    root.style.setProperty("--kx-accent", rgb);
  } catch {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
