import "./globals.css";

// Root layout must NOT enforce auth redirects.
// Auth gating is handled in app/(app)/layout.tsx so routes like /login can render.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    // Single source of truth is the "dark" class (Tailwind). We also set data-theme for debugging.
    const themeRaw = localStorage.getItem('kx_theme') || 'dark';
    const theme = (themeRaw === 'light') ? 'light' : 'dark';

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('kx-light', theme === 'light');

    // Accent pairs power the subtle premium depth gradients.
    const accent = localStorage.getItem('kx_accent') || 'indigo';
    const map = {
      indigo: { a: '99 102 241', b: '56 189 248' },
      purple: { a: '168 85 247', b: '59 130 246' },
      blue: { a: '59 130 246', b: '34 211 238' },
      cyan: { a: '34 211 238', b: '99 102 241' },
      green: { a: '34 197 94', b: '34 211 238' },
      orange: { a: '249 115 22', b: '59 130 246' },
    };
    const pair = map[accent] || map.indigo;
    root.style.setProperty('--kx-accent', pair.a);
    root.style.setProperty('--kx-accent-2', pair.b);
  } catch {}
})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
