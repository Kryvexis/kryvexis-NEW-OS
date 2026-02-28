'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function NavIcon({ name }: { name: 'dashboard' | 'clients' | 'products' | 'suppliers' | 'upload' | 'quotes' | 'invoices' | 'payments' | 'accounts' | 'reports' | 'settings' | 'help' | 'accountCenter' }) {
  const common = 'h-4 w-4'
  switch (name) {
    case 'dashboard':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-11h7V4h-7v5Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'clients':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'products':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 7h10v10H7V7Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M9 3h6v4H9V3Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'suppliers':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 10h18v10H3V10Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M7 10V6h10v4" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M7 14h4" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'quotes':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3h10v18H7V3Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M9 7h6M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'invoices':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3h10v18l-2-1-3 1-3-1-2 1V3Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'payments':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 8h16v8H4V8Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M7 12h4" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'accounts':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 4h12v16H6V4Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'accountCenter':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M4 22a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        </svg>
      )
    case 'reports':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 20V4" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M5 18h15" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M8 16v-5M12 16v-8M16 16v-3" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'upload':
      return '⬆️'
    case 'help':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9.2 9a3 3 0 1 1 5.1 2c-.8.7-1.3 1.1-1.3 2.5" stroke="currentColor" strokeWidth="1.5" opacity="0.9" strokeLinecap="round"/>
          <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10Z" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>
        </svg>
      )
    case 'settings':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M19.4 15a7.9 7.9 0 0 0 .1-2l2-1.1-2-3.4-2.3.6a8 8 0 0 0-1.7-1l-.3-2.4H9l-.3 2.4a8 8 0 0 0-1.7 1l-2.3-.6-2 3.4 2 1.1a7.9 7.9 0 0 0 .1 2l-2 1.1 2 3.4 2.3-.6a8 8 0 0 0 1.7 1l.3 2.4h6l.3-2.4a8 8 0 0 0 1.7-1l2.3.6 2-3.4-2-1.1Z" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
        </svg>
      )
  }
}

export const navMainItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' as const },
  { href: '/clients', label: 'Clients', icon: 'clients' as const },
  { href: '/products', label: 'Products', icon: 'products' as const },
  { href: '/suppliers', label: 'Suppliers', icon: 'suppliers' as const },
  { href: '/quotes', label: 'Quotes', icon: 'quotes' as const },
  { href: '/invoices', label: 'Invoices', icon: 'invoices' as const },
  { href: '/payments', label: 'Payments', icon: 'payments' as const },
  { href: '/accounts', label: 'Accounts', icon: 'accounts' as const },
  { href: '/reports', label: 'Reports', icon: 'reports' as const },
]

// Bottom section: keep this near the footer. Import Center must be second-to-last.
export const navBottomItems = [
  { href: '/settings', label: 'Settings', icon: 'settings' as const },
  { href: '/help', label: 'Help', icon: 'help' as const },
  { href: '/import-station', label: 'Import Center', icon: 'upload' as const },
  { href: '/account-center', label: 'Account Center', icon: 'accountCenter' as const },
]

export function Sidebar({ userEmail, workspaceName, memberType }: { userEmail?: string; workspaceName?: string; memberType?: string }) {
  const pathname = usePathname() || ''
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem('kx_sidebar_collapsed')
      setCollapsed(v === '1')
    } catch {}
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem('kx_sidebar_collapsed', next ? '1' : '0')
      } catch {}
      return next
    })
  }

  const widthCls = collapsed ? 'md:w-[92px]' : 'md:w-[280px]'

  return (
    <aside
      className={
        'hidden md:flex md:flex-col border-r kx-hairline transition-[width] duration-300 kx-sidebar ' +
        widthCls
      }
    >
      <div className={collapsed ? 'px-3 pt-5 pb-4' : 'px-5 pt-5 pb-4'}>
        <div className={collapsed ? 'flex flex-col items-center gap-3' : 'flex items-start justify-between gap-3'}>
          <div className={collapsed ? 'flex flex-col items-center' : 'flex flex-col'}>
            {/* Logo (no "block" container). Double-size with soft glow. */}
            <Image
              src="/kryvexis-logo.png"
              alt="Kryvexis"
              width={collapsed ? 120 : 240}
              height={collapsed ? 120 : 240}
              className={collapsed ? 'h-[120px] w-[120px] object-contain' : 'h-[240px] w-[240px] object-contain'}
              style={{
                filter:
                  'drop-shadow(0 0 18px rgba(var(--kx-accent), .22)) drop-shadow(0 10px 28px rgba(0,0,0,.35))',
              }}
              priority
            />

            <div className={collapsed ? 'mt-2 text-center' : 'mt-2'}>
              <div className={collapsed ? 'text-[12px] font-semibold tracking-tight' : 'text-[15px] font-semibold tracking-tight'}>Kryvexis OS</div>
              {!collapsed && <div className="text-xs kx-muted">{workspaceName ?? 'Workspace'}</div>}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={
              'h-10 w-10 rounded-xl border border-[rgba(var(--kx-fg),.12)] bg-[rgba(var(--kx-fg),.05)] text-[rgba(var(--kx-fg),.70)] transition hover:bg-[rgba(var(--kx-fg),.10)] hover:text-[rgba(var(--kx-fg),.90)] ' +
              (collapsed ? '' : '')
            }
          >
            <svg
              className={
                'mx-auto h-5 w-5 transition-transform duration-300 ' +
                (collapsed ? 'rotate-180' : '')
              }
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path d="M14 6 8 12l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <nav className={(collapsed ? 'px-2' : 'px-3') + ' pb-2 space-y-1'}>
        {navMainItems.map((it) => {
          const on = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link
              key={it.href}
              href={it.href}
              data-tour={`nav-${it.icon}`}
              title={collapsed ? it.label : undefined}
              className={'kx-navlink group flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'is-active' : '')}
            >
              <span className={(collapsed ? 'mx-auto' : 'ml-3') + ' ' + (on ? 'text-[rgba(var(--kx-fg),.92)]' : 'text-[rgba(var(--kx-fg),.70)] group-hover:text-[rgba(var(--kx-fg),.90)]')}>
                <NavIcon name={it.icon} />
              </span>
              {!collapsed && <span className="ml-2 tracking-tight">{it.label}</span>}
              {on && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(var(--kx-accent), 0.95)' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="mt-auto" />
      <nav className={(collapsed ? 'px-2' : 'px-3') + ' pt-2 pb-3 space-y-1'}>
        {navBottomItems.map((it) => {
          const on = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link
              key={it.href}
              href={it.href}
              title={collapsed ? it.label : undefined}
              className={'kx-navlink group flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'is-active' : '')}
            >
              <span className={(collapsed ? 'mx-auto' : 'ml-3') + ' ' + (on ? 'text-[rgba(var(--kx-fg),.92)]' : 'text-[rgba(var(--kx-fg),.70)] group-hover:text-[rgba(var(--kx-fg),.90)]')}>
                <NavIcon name={it.icon} />
              </span>
              {!collapsed && <span className="ml-2 tracking-tight">{it.label}</span>}
              {on && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(var(--kx-accent), 0.95)' }} />}
            </Link>
          )
        })}
      </nav>

      {userEmail && !collapsed && (
        <div className="mt-auto px-5 py-4 border-t" style={{ borderColor: 'rgba(var(--kx-border), .12)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider kx-muted3">Signed in as</div>
              <div className="mt-1 text-xs text-[rgba(var(--kx-fg),.86)] break-all">{userEmail}</div>
            </div>
            {memberType && (
              <span className="kx-chip" title="Member type">
                {memberType}
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}