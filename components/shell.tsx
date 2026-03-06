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

function pageSubtitleFromPath(pathname: string) {
  const p = (pathname || '/dashboard').split('?')[0]
  if (p.startsWith('/sales')) return 'Revenue, customers, products, and selling activity in one place.'
  if (p.startsWith('/buyers')) return 'Procurement, reorder signals, and stock pressure.'
  if (p.startsWith('/accounting')) return 'Keep the books, balances, and cashflow in control.'
  if (p.startsWith('/operations')) return 'Inventory, workflows, and fulfilment.'
  if (p.startsWith('/insights')) return 'Performance signals and business trends.'
  return 'Your business command center.'
}

export default function Shell({ userEmail, role, children }: { userEmail: string; role: UserRole; children: React.ReactNode }) {
  const pathname = usePathname() || '/dashboard'
  const title = pageTitleFromPath(pathname)
  const subtitle = pageSubtitleFromPath(pathname)

  return (
    <div className="kx-shell min-h-screen">
      <CommandPalette />
      <div className="flex min-h-screen">
        <Sidebar userEmail={userEmail} workspaceName="Kryvexis" role={role} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 px-4 py-3 md:px-5">
            <div className="kx-topbar-surface mx-auto flex max-w-[1380px] items-center justify-between gap-3 rounded-[26px] px-4 py-3 md:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="md:hidden">
                  <MobileNav />
                </div>
                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(var(--kx-accent)/0.10)] text-[rgb(var(--kx-accent-2))] md:flex">
                  <Image src="/kryvexis-logo.png" alt="Kryvexis" width={26} height={26} className="h-6 w-6 object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold tracking-tight text-kx-fg md:text-xl">{title}</div>
                  <div className="hidden truncate text-sm kx-muted md:block">{subtitle}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-[rgba(var(--kx-border),.14)] bg-[rgba(var(--kx-surface),.88)] px-3 py-2 text-sm md:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="kx-muted">{roleLabel(role)}</span>
                </div>
                <div className="hidden text-right md:block">
                  <div className="text-[11px] uppercase tracking-[0.18em] kx-muted2">Workspace</div>
                  <div className="max-w-[220px] truncate text-sm font-medium text-kx-fg">{userEmail || 'Signed in'}</div>
                </div>
                <LogoutButton />
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-8 pt-1 md:px-5">
            <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
