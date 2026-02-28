import "./globals.css";

// Root layout must NOT enforce auth redirects.
// Auth gating is handled in app/(app)/layout.tsx so routes like /login can render.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const themeRaw = localStorage.getItem('kx_theme_v2') || 'dark';
    const theme = (themeRaw === 'light') ? 'light' : 'dark';

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('kx-light', theme === 'light');

    // Native form controls match theme
    root.style.colorScheme = theme;

    const accent = localStorage.getItem('kx_accent_v2') || 'cyan';
    const map = {
      cyan: '34 211 238',
      blue: '59 130 246',
      purple: '168 85 247',
      green: '34 197 94',
      orange: '249 115 22',
    };
    const rgb = map[accent] || map.cyan;
    root.style.setProperty('--kx-accent', rgb);
  } catch {}
})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
