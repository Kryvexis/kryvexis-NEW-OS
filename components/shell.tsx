'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'

import CommandPalette from './command-palette'
import LogoutButton from './logout-button'
import MobileNav from './nav/MobileNav'
import { Sidebar } from './nav'
import type { UserRole } from '@/lib/roles/shared'
import { roleLabel } from '@/lib/roles/shared'

function pageTitleFromPath(pathname: string) {
  const p = (pathname || '/dashboard').split('?')[0]
  if (p === '/' || p === '/dashboard') return 'Dashboard'
  if (p.startsWith('/clients')) return 'Clients'
  if (p.startsWith('/products')) return 'Products'
  if (p.startsWith('/suppliers')) return 'Suppliers'
  if (p.startsWith('/buyers')) return 'Buyers'
  if (p.startsWith('/quotes')) return 'Quotes'
  if (p.startsWith('/invoices')) return 'Invoices'
  if (p.startsWith('/payments')) return 'Payments'
  if (p.startsWith('/accounts')) return 'Accounts'
  if (p.startsWith('/reports')) return 'Reports'
  if (p.startsWith('/operations')) return 'Operations'
  if (p.startsWith('/settings')) return 'Settings'
  if (p.startsWith('/help')) return 'Help'
  if (p.startsWith('/import-station')) return 'Import Center'
  if (p.startsWith('/account-center')) return 'Account Center'
  return 'Kryvexis OS'
}

function sectionEyebrow(pathname: string) {
  if (pathname.startsWith('/sales')) return 'Revenue workspace'
  if (pathname.startsWith('/accounting')) return 'Finance control'
  if (pathname.startsWith('/operations')) return 'Ops management'
  if (pathname.startsWith('/insights')) return 'Business intelligence'
  return 'Business OS'
}

export default function Shell({ userEmail, role, children }: { userEmail: string; role: UserRole; children: React.ReactNode }) {
  const pathname = usePathname() || '/dashboard'
  const title = pageTitleFromPath(pathname)
  const eyebrow = sectionEyebrow(pathname)

  return (
    <div className="kx-shell min-h-screen">
      <CommandPalette />

      <div className="flex min-h-screen">
        <Sidebar userEmail={userEmail} workspaceName="Kryvexis" role={role} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 kx-topbar-surface">
            <div className="px-4 md:px-6">
              <div className="mx-auto flex h-16 w-full max-w-[1380px] items-center gap-3 md:gap-4">
                <div className="md:hidden">
                  <MobileNav userEmail={userEmail} role={role} />
                </div>

                <div className="min-w-0 flex items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2 md:hidden">
                    <Image src="/kryvexis-logo.png" alt="Kryvexis" width={28} height={28} className="h-7 w-7" priority />
                    <div className="text-sm font-semibold tracking-tight">Kryvexis</div>
                  </div>

                  <div className="hidden md:block min-w-0">
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-kx-muted">{eyebrow}</div>
                    <div className="truncate text-[19px] font-semibold tracking-tight text-kx-fg">{title}</div>
                  </div>

                  <div className="md:hidden truncate text-sm font-semibold tracking-tight text-kx-fg">{title}</div>
                </div>

                <div className="flex-1" />

                <div className="hidden lg:flex items-center gap-2 rounded-full border border-kx bg-kx-surface/70 px-3 py-2 text-xs text-kx-muted shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  System ready
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <div
                    className="hidden max-w-[240px] truncate rounded-full border border-kx bg-kx-surface/72 px-3 py-2 text-xs text-kx-fg/75 shadow-sm lg:block"
                    title={userEmail}
                  >
                    {userEmail}
                  </div>

                  <span className="hidden md:inline-flex items-center rounded-full border border-kx bg-kx-surface/72 px-2.5 py-1 text-[11px] text-kx-muted shadow-sm">
                    {roleLabel(role)}
                  </span>

                  <LogoutButton />
                </div>
              </div>
            </div>
          </header>

          <main className="w-full flex-1 px-4 py-5 md:px-6 md:py-7">
            <div className="mx-auto w-full max-w-[1380px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
