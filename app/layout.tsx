import './globals.css'

// Root layout must NOT enforce auth redirects.
// Auth gating is handled in app/(app)/layout.tsx so routes like /login can render.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    // v2 keys: forces a clean reset for anyone who previously saved light mode
    const theme = localStorage.getItem('kx_theme_v2') || 'dark';
    document.documentElement.dataset.theme = (theme === 'light') ? 'light' : 'dark';
    const accent = localStorage.getItem('kx_accent_v2') || 'cyan';
    const map = {
      cyan: '34 211 238',
      blue: '59 130 246',
      purple: '168 85 247',
      green: '34 197 94',
      orange: '249 115 22',
    };
    const rgb = map[accent] || map.cyan;
    document.documentElement.style.setProperty('--kx-accent', rgb);
  } catch {}
})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
