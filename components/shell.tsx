'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React from 'react'

import CommandPalette from './command-palette'
import LogoutButton from './logout-button'
import MobileNav from './nav/MobileNav'
import { Sidebar } from './nav'

import type { UserRole } from '@/lib/roles/shared'
import type { AppModule } from '@/lib/rbac'
import { roleLabel } from '@/lib/roles/shared'

// Desktop UI is enforced LIGHT (clean reference UI). We remove the dark-mode toggle to avoid mismatched screens.

function pageTitleFromPath(pathname: string) {
  const p = (pathname || '/dashboard').split('?')[0]
  if (p === '/' || p === '/dashboard') return 'Dashboard'
  if (p.startsWith('/clients')) return 'Clients'
  if (p.startsWith('/products')) return 'Products'
  if (p.startsWith('/suppliers')) return 'Suppliers'
  if (p.startsWith('/buyers')) return 'Buyers'
  if (p.startsWith('/sales')) return 'Sales'
  if (p.startsWith('/quotes')) return 'Quotes'
  if (p.startsWith('/invoices')) return 'Invoices'
  if (p.startsWith('/operations')) return 'Operations'
  if (p.startsWith('/accounting')) return 'Accounting'
  if (p.startsWith('/insights')) return 'Insights'
  if (p.startsWith('/settings')) return 'Settings'
  if (p.startsWith('/import-station')) return 'Import Center'
  if (p.startsWith('/account-center')) return 'Account Center'
  return 'Kryvexis OS'
}

export default function Shell({
  userEmail,
  role,
  modules,
  children,
}: {
  userEmail: string
  role: UserRole
  modules: AppModule[]
  children: React.ReactNode
}) {
  const pathname = usePathname() || '/dashboard'
  const title = pageTitleFromPath(pathname)

  return (
    <div className="min-h-screen">
      <CommandPalette />

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <Sidebar userEmail={userEmail} workspaceName="Kryvexis" role={role} modules={modules} />

        {/* Main area */}
        <div className="flex min-h-screen w-full flex-col bg-kx-bg">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b bg-kx-surface/80 backdrop-blur">
            <div className="px-5">
              <div className="flex h-14 w-full max-w-[1280px] items-center gap-3">
                {/* Mobile menu */}
                <div className="md:hidden">
                  <MobileNav userEmail={userEmail} role={role} modules={modules} />
                </div>

                {/* Title */}
                <div className="flex min-w-0 items-center gap-3">
                  {/* On mobile, show small brand mark */}
                  <div className="flex items-center gap-2 md:hidden">
                    <Image src="/kryvexis-logo.png" alt="Kryvexis" width={26} height={26} className="h-6 w-6" priority />
                    <div className="text-sm font-semibold tracking-tight">Kryvexis</div>
                  </div>

                  <div className="hidden md:block">
                    <div className="text-sm font-semibold tracking-tight text-kx-fg">{title}</div>
                    <div className="text-[11px] kx-muted">Kryvexis OS</div>
                  </div>

                  <div className="truncate text-sm font-semibold tracking-tight text-kx-fg md:hidden">{title}</div>
                </div>

                <div className="flex-1" />

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  <div
                    className="hidden max-w-[260px] truncate rounded-full border bg-kx-surface/30 px-3 py-2 text-xs text-kx-fg/75 lg:block"
                    style={{ borderColor: 'rgb(var(--kx-border) / 0.10)' }}
                    title={userEmail}
                  >
                    {userEmail}
                  </div>

                  <div className="hidden items-center gap-2 md:flex">
                    <span
                      className="rounded-full border px-2 py-1 text-[11px] kx-muted"
                      style={{ borderColor: 'rgb(var(--kx-border) / 0.12)' }}
                      title="Role"
                    >
                      {roleLabel(role)}
                    </span>
                  </div>

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
