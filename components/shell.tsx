'use client'

import { useMemo, useState } from 'react'
import CommandPalette from './command-palette'
import LogoutButton from './logout-button'
import MobileNav from './nav/MobileNav'
import ThemeToggle from './theme/ThemeToggle'
import { Sidebar } from './nav'

function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a4.2 4.2 0 1 0 0-8.4A4.2 4.2 0 0 0 12 12Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function Shell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  const [q, setQ] = useState('')
  const placeholder = useMemo(() => 'Search… (Ctrl K)', [])

  return (
    <div className="min-h-screen flex">
      <CommandPalette />

      {/* Desktop sidebar (fixed + collapsible) */}
      <Sidebar userEmail={userEmail} workspaceName="Workspace" memberType="" />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header (minimal) */}
        <header className="sticky top-0 z-40 border-b border-[rgba(var(--kx-border),.10)] bg-[rgba(var(--kx-shell),.72)] backdrop-blur-xl">
          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-3 flex items-center gap-3">
            {/* Mobile hamburger + drawer */}
            <MobileNav userEmail={userEmail} />

            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative max-w-[520px]">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={placeholder}
                  className="kx-input w-full pr-16"
                />
                <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-[rgba(var(--kx-fg),.50)]">
                  <span className="kx-badge px-1.5 py-0.5">Ctrl</span>
                  <span className="kx-badge px-1.5 py-0.5">K</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2 rounded-2xl border border-[rgba(var(--kx-fg),.12)] bg-[rgba(var(--kx-fg),.05)] px-3 py-2 text-[12px] text-[rgba(var(--kx-fg),.82)]">
                <UserIcon />
                <span className="max-w-[220px] truncate" title={userEmail}>{userEmail}</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
