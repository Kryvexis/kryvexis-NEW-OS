
import "./globals.css";

const themeInitScript = `
(() => {
  try {
    const storedTheme = localStorage.getItem("kx-theme");
    const theme = storedTheme || "light";

    const storedAccent = localStorage.getItem("kx-accent");
    const accent = storedAccent || "34 211 238";

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.setProperty("--kx-accent", accent);
  } catch (e) {}
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
