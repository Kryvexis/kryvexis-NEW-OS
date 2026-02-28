'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import CommandPalette from './command-palette'
import LogoutButton from './logout-button'
import MobileNav from './nav/MobileNav'
import ThemeToggle from './theme/ThemeToggle'
import { navMainItems, NavIcon } from './nav'

function TopTabs() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-1 overflow-x-auto rounded-full border bg-kx-surface2 px-1 py-1"
      style={{ borderColor: 'rgb(var(--kx-border) / 0.10)' }}
    >
      {navMainItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              'group inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm transition ' +
              (active
                ? 'bg-kx-surface text-kx-fg border border-[rgba(var(--kx-border),.10)]'
                : 'text-kx-fg/70 hover:bg-kx-surface hover:text-kx-fg')
            }
          >
            <span className={active ? 'text-kx-fg' : 'text-kx-fg/60 group-hover:text-kx-fg/90'} aria-hidden>
              <NavIcon name={item.icon} />
            </span>
            <span className="whitespace-nowrap tracking-tight">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default function Shell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <CommandPalette />

      {/* Mobile header */}
      <div
        className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b bg-kx-shell px-3 md:hidden"
        style={{ borderColor: 'rgb(var(--kx-border) / 0.10)' }}
      >
        <MobileNav userEmail={userEmail} />

        <div className="flex items-center gap-2">
          <Image src="/kryvexis-logo.png" alt="Kryvexis" width={32} height={32} className="h-8 w-8" priority />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Kryvexis</div>
            <div className="text-[11px] kx-muted">OS</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      {/* Desktop header */}
      <header
        className="sticky top-0 z-40 hidden border-b bg-kx-shell md:block"
        style={{ borderColor: 'rgb(var(--kx-border) / 0.10)' }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={38} height={38} className="h-9 w-9" priority />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Kryvexis</div>
              <div className="text-[11px] kx-muted">OS</div>
            </div>
          </Link>

          {/* Tabs */}
          <div className="flex-1 px-2">
            <TopTabs />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div
              className="hidden max-w-[260px] truncate rounded-full border bg-kx-surface/70 px-3 py-2 text-xs text-kx-fg/75 lg:block"
              style={{ borderColor: 'rgb(var(--kx-border) / 0.10)' }}
              title={userEmail}
            >
              {userEmail}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
