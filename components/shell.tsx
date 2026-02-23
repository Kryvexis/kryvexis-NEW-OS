import { Sidebar } from './nav'
import Topbar from './topbar'
import LogoutButton from './logout-button'
import CommandPalette from './command-palette'

export default function Shell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Topbar />
        <CommandPalette />
        <div className="px-4 py-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="kx-badge">
              <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(var(--kx-accent), 0.95)' }} />
              <span className="ml-2 text-white/70">Signed in</span>
              <span className="ml-2 text-white">{userEmail}</span>
            </span>
          </div>
          <LogoutButton />
        </div>
        <div className="px-4 md:px-6 pb-12">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  )
}
