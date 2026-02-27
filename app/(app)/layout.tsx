export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Root app/layout.tsx owns <html>, theme bootstrapping, and globals.
  // Keep this layout minimal so it doesn't override the dark-first theme.
  return children
}
