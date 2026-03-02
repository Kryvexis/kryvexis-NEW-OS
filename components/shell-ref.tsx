'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import CommandPalette from './command-palette'
import LogoutButton from './logout-button'
import MobileNav from './nav/MobileNav'
import ThemeToggle from './theme/ThemeToggle'

type TopTab = { href: string; label: string }
const topTabs: TopTab[] = [
  { href: '/sales', label: 'Dashboard' },
  { href: '/products', label: 'Inventory' },
  { href: '/sales/clients', label: 'Clients' },
  { href: '/sales/invoices', label: 'Sales' },
  { href: '/reports', label: 'Reports' },
]

function isActive(pathname: string, href: string) {
  if (href === '/sales') return pathname === '/sales' || pathname === '/dashboard'
  return pathname === href || pathname.startsWith(href + '/')
}

export default function ShellRef({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  const pathname = usePathname() || '/sales'

  return (
    <div className="min-h-screen">
      <CommandPalette />

      <div className="flex min-h-screen">
        {/* Left sidebar — compact + clean like reference */}
        <aside className="hidden md:flex md:w-[240px] md:flex-col bg-kx-shell/90" style={{ boxShadow: 'var(--kx-shadow-sidebar)' }}>
          <div className="px-4 py-4">
            <div className="flex items-center gap-2">
              <Image src="/kryvexis-logo.png" alt="Kryvexis" width={28} height={28} className="h-7 w-7" priority />
              <div className="font-semibold tracking-tight">Kryvexis OS</div>
            </div>
          </div>

          <nav className="px-2 pb-3 space-y-1">
            {[
              { href: '/sales', label: 'Dashboard' },
              { href: '/insights', label: 'Insights' },
              { href: '/operations', label: 'Tasks' },
              { href: '/operations/notifications', label: 'Notifications' },
              { href: '/buyers', label: 'Buyers' },
            ].map((it) => {
              const on = isActive(pathname, it.href)
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ' +
                    (on ? 'bg-kx-surface shadow-sm font-medium' : 'hover:bg-kx-surface/70')
                  }
                >
                  <span className={on ? 'text-kx-fg' : 'text-kx-muted'}>{it.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto px-4 py-3 text-xs text-kx-muted">
            <div className="uppercase tracking-wider">Signed in as</div>
            <div className="mt-1 break-all text-kx-fg/80">{userEmail}</div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top header — blue bar + tabs + search (reference UI) */}
          <header
            className="sticky top-0 z-40"
            style={{
              background: 'linear-gradient(90deg, #0B2340 0%, #163B63 55%, #0B2340 100%)',
              boxShadow: 'var(--kx-shadow-header)',
            }}
          >
            <div className="px-5">
              <div className="flex h-14 items-center gap-3">
                {/* Mobile menu */}
                <div className="md:hidden">
                  <MobileNav userEmail={userEmail} />
                </div>

                {/* Desktop tabs */}
                <nav className="hidden md:flex items-center gap-1">
                  {topTabs.map((t) => {
                    const on = isActive(pathname, t.href)
                    return (
                      <Link
                        key={t.href}
                        href={t.href}
                        className={
                          'rounded-md px-3 py-2 text-sm transition ' +
                          (on ? 'bg-white/15 text-white font-medium' : 'text-white/80 hover:text-white hover:bg-white/10')
                        }
                      >
                        {t.label}
                      </Link>
                    )
                  })}
                </nav>

                <div className="flex-1" />

                {/* Search */}
                <div className="hidden lg:flex items-center">
                  <div className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-white/80 w-[340px]">
                    <span className="text-white/70">🔎</span>
                    <input
                      className="w-full bg-transparent text-sm outline-none placeholder:text-white/55"
                      placeholder="Quick Search…"
                      aria-label="Quick Search"
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LogoutButton />
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="w-full flex-1 px-5 py-6">
            <div className="w-full max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
