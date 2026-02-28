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
        {/* Top header (premium glass) */}
        <header className="sticky top-0 z-40 bg-kx-shell/30 backdrop-blur-xl shadow-[0_14px_60px_rgba(0,0,0,0.55)]">
          <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
            <div className="grid h-14 w-full grid-cols-[auto,1fr,auto] items-center gap-3">
              {/* Left */}
              <div className="flex items-center gap-2">
                {/* Mobile hamburger + drawer */}
                <MobileNav userEmail={userEmail} />
              </div>

              {/* Center */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-xl">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={placeholder}
                    className="kx-input w-full pr-16"
                  />
                  <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-[11px] text-kx-fg/55 md:flex">
                    <span className="kx-badge px-1.5 py-0.5">Ctrl</span>
                    <span className="kx-badge px-1.5 py-0.5">K</span>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center justify-end gap-2">
                <ThemeToggle />
                <div className="hidden md:flex items-center gap-2 rounded-2xl bg-kx-fg/5 px-3 py-2 text-[12px] text-kx-fg/85 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5">
                  <UserIcon />
                  <span className="max-w-[220px] truncate" title={userEmail}>{userEmail}</span>
                </div>
                <LogoutButton />
              </div>
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
