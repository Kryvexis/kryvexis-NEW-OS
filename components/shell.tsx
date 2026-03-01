'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import CommandPalette from './command-palette'
import LogoutButton from './logout-button'
import MobileNav from './nav/MobileNav'
import { Sidebar } from './nav'
import ThemeToggle from './theme/ThemeToggle'
import CompanySwitcher, { type CompanyOption } from './company-switcher'

function pageTitleFromPath(pathname: string) {
  const p = (pathname || '/dashboard').split('?')[0]
  if (p === '/' || p === '/dashboard') return 'Dashboard'
  if (p.startsWith('/sales')) return 'Sales'
  if (p.startsWith('/accounting')) return 'Accounting'
  if (p.startsWith('/operations')) return 'Operations'
  if (p.startsWith('/insights')) return 'Insights'
  if (p.startsWith('/clients')) return 'Clients'
  if (p.startsWith('/products')) return 'Products'
  if (p.startsWith('/suppliers')) return 'Suppliers'
  if (p.startsWith('/quotes')) return 'Quotes'
  if (p.startsWith('/invoices')) return 'Invoices'
  if (p.startsWith('/payments')) return 'Payments'
  if (p.startsWith('/accounts')) return 'Accounts'
  if (p.startsWith('/reports')) return 'Reports'
  if (p.startsWith('/settings')) return 'Settings'
  if (p.startsWith('/help')) return 'Help'
  if (p.startsWith('/import-station')) return 'Import Center'
  if (p.startsWith('/account-center')) return 'Account Center'
  return 'Kryvexis OS'
}

export default function Shell({
  userEmail,
  workspaceName,
  workspacePhone,
  currentCompanyId,
  companies,
  children,
}: {
  userEmail: string
  workspaceName?: string
  workspacePhone?: string
  currentCompanyId?: string
  companies?: CompanyOption[]
  children: React.ReactNode
}) {
  const pathname = usePathname() || '/dashboard'
  const title = pageTitleFromPath(pathname)
  const [companyOpen, setCompanyOpen] = React.useState(false)

  const canSwitch = (companies?.length || 0) > 1

  return (
    <div className="min-h-screen">
      <CommandPalette />

      <CompanySwitcher
        open={companyOpen}
        onClose={() => setCompanyOpen(false)}
        currentCompanyId={currentCompanyId}
        companies={companies || []}
      />

      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <Sidebar userEmail={userEmail} workspaceName={workspaceName || 'Kryvexis'} workspacePhone={workspacePhone} />

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Slim topbar (desktop + mobile) */}
          <header className="sticky top-0 z-40 bg-kx-shell/65 backdrop-blur-md" style={{ boxShadow: 'var(--kx-shadow-header)' }}>
            <div className="px-5">
              <div className="flex h-14 w-full max-w-[1280px] items-center gap-3">
                {/* Mobile menu */}
                <div className="md:hidden">
                  <MobileNav userEmail={userEmail} workspaceName={workspaceName} onOpenCompanySwitcher={canSwitch ? () => setCompanyOpen(true) : undefined} />
                </div>

                {/* Title */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* On mobile, show small brand mark */}
                  <div className="flex items-center gap-2 md:hidden">
                    <Image src="/kryvexis-logo.png" alt="Kryvexis" width={26} height={26} className="h-6 w-6" priority />
                    <div className="text-sm font-semibold tracking-tight">Kryvexis</div>
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-semibold tracking-tight text-kx-fg">{title}</div>
                    <div className="text-[11px] kx-muted">Kryvexis OS</div>
                  </div>
                  <div className="md:hidden text-sm font-semibold tracking-tight text-kx-fg truncate">{title}</div>
                </div>

                <div className="flex-1" />

                {/* Company pill (desktop) */}
                {canSwitch ? (
                  <button
                    onClick={() => setCompanyOpen(true)}
                    className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(var(--kx-fg),.04)] px-3 py-2 text-xs text-[rgba(var(--kx-fg),.90)] hover:bg-[rgba(var(--kx-fg),.08)]"
                    title="Switch company"
                  >
                    <span className="truncate max-w-[180px]">{workspaceName || 'Workspace'}</span>
                    <span className="opacity-70">▾</span>
                  </button>
                ) : null}

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <div
                    className="hidden max-w-[260px] truncate rounded-full border bg-kx-surface/30 px-3 py-2 text-xs text-kx-fg/75 lg:block"
                    style={{ borderColor: 'rgb(var(--kx-border) / 0.10)' }}
                    title={userEmail}
                  >
                    {userEmail}
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
