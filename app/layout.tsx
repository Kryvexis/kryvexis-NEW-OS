import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kryvexis OS',
  description: 'Kryvexis OS',
}

// IMPORTANT:
// Do NOT enforce auth in the root layout.
// Root layout wraps *all* routes including /login, so redirecting here causes
// ERR_TOO_MANY_REDIRECTS.
// Auth protection belongs in app/(app)/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
