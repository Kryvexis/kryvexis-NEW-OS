import "./globals.css";
import InstallPrompt from "@/components/pwa/InstallPrompt";

// Root layout must NOT enforce auth redirects.
// Auth gating is handled in app/(app)/layout.tsx so routes like /login can render.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Default to LIGHT theme to match the Kryvexis OS reference UI.
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    // Single source of truth is the "dark" class (Tailwind). We also set data-theme for debugging.
    const themeRaw = localStorage.getItem('kx_theme') || 'light';
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
      <body className="kx-no-lines">
        <InstallPrompt />
        {children}
      </body>
    </html>
  );
}
