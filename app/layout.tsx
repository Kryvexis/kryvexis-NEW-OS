import "./globals.css";
import InstallPrompt from "@/components/pwa/InstallPrompt";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b1220" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  try {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('kx_theme');
    const theme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
    root.dataset.theme = theme;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('kx-light', theme === 'light');

    const accent = localStorage.getItem('kx_accent') || 'blue';
    const map = {
      indigo: { a: '99 102 241', b: '56 189 248' },
      purple: { a: '168 85 247', b: '59 130 246' },
      blue: { a: '59 130 246', b: '34 211 238' },
      cyan: { a: '34 211 238', b: '99 102 241' },
      green: { a: '34 197 94', b: '34 211 238' },
      orange: { a: '249 115 22', b: '59 130 246' },
    };
    const pair = map[accent] || map.blue;
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
