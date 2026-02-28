import "./globals.css";

// Root layout must NOT enforce auth redirects.
// Auth gating is handled in app/(app)/layout.tsx so routes like /login can render.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash by setting the class before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const themeRaw = localStorage.getItem('kx_theme_v2') || 'dark';
    const theme = (themeRaw === 'light') ? 'light' : 'dark';
    const root = document.documentElement;

    root.classList.toggle('dark', theme === 'dark');
    // Let the browser render built-in UI correctly (form controls, scrollbars, etc.)
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
      <body className="min-h-screen bg-kx-bg text-kx-fg">{children}</body>
    </html>
  );
}
