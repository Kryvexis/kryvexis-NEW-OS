'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function NavIcon({ name }: { name: 'sales' | 'accounting' | 'operations' | 'insights' | 'settings' | 'help' | 'accountCenter' | 'upload' }) {
  const common = 'h-4 w-4'
  switch (name) {
    case 'sales':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
          <path d="M7 15l3-3 3 2 4-5" stroke="currentColor" strokeWidth="1.6" opacity="0.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'accounting':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 4h12v16H6V4Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'operations':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 7h10v10H7V7Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M9 3h6v4H9V3Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
        </svg>
      )
    case 'insights':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 20V4" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
          <path d="M5 18h15" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
          <path d="M8 16v-5M12 16v-8M16 16v-3" stroke="currentColor" strokeWidth="1.6" opacity="0.9" strokeLinecap="round" />
        </svg>
      )
    case 'accountCenter':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M4 22a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
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
  { href: '/sales', label: 'Sales', icon: 'sales' as const },
  { href: '/accounting', label: 'Accounting', icon: 'accounting' as const },
  { href: '/operations', label: 'Operations', icon: 'operations' as const },
  { href: '/insights', label: 'Insights', icon: 'insights' as const },
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

  // Sidebar mode: fixed width on desktop (A), hidden on small screens (C).
  // We intentionally remove the collapsed mode to keep the layout clean and predictable.
  // Slightly wider so the brand area + nav labels breathe.
  const widthCls = 'md:w-[276px]'

  return (
    <aside
      className={'hidden md:flex md:flex-col ' + widthCls}
      style={{
        background: 'linear-gradient(180deg, rgb(var(--kx-shell) / 0.94), rgb(var(--kx-shell) / 0.86))',
        boxShadow: 'var(--kx-shadow-sidebar)',
      }}
    >
      <div className={'px-5 pt-4 pb-3'}>
        <div className={'flex items-start justify-between gap-3'}>
          <div className={'flex flex-col'}>
            {/* Logo (no "block" container). Double-size with soft glow. */}
            <Image
              src="/kryvexis-logo.png"
              alt="Kryvexis"
              width={160}
              height={160}
              className={'h-[150px] w-[150px] object-contain'}
              style={{
                filter:
                  'drop-shadow(0 0 18px rgba(var(--kx-accent), .22)) drop-shadow(0 10px 28px rgba(0,0,0,.35))',
              }}
              priority
            />

            <div className={'mt-1'}>
              <div className={'text-[14px] font-semibold tracking-tight leading-tight'}>Kryvexis OS</div>
              <div className="text-[11px] kx-muted leading-tight">{workspaceName ?? 'Workspace'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className={'px-3 pb-2 space-y-1'}>
        {navMainItems.map((it) => {
          const on = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link
              key={it.href}
              href={it.href}
              data-tour={`nav-${it.icon}`}
              title={it.label}
              className={'kx-navlink group flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'is-active' : '')}
            >
              <span className={'ml-3 ' + (on ? 'text-[rgba(var(--kx-fg),.92)]' : 'text-[rgba(var(--kx-fg),.70)] group-hover:text-[rgba(var(--kx-fg),.90)]')}>
                <NavIcon name={it.icon} />
              </span>
              <span className="ml-2 tracking-tight">{it.label}</span>
              {on && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(var(--kx-accent), 0.95)' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom navigation */}
      <div className="mt-auto" />
      <nav className={'px-3 pt-2 pb-3 space-y-1'}>
        {navBottomItems.map((it) => {
          const on = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link
              key={it.href}
              href={it.href}
              title={it.label}
              className={'kx-navlink group flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'is-active' : '')}
            >
              <span className={'ml-3 ' + (on ? 'text-[rgba(var(--kx-fg),.92)]' : 'text-[rgba(var(--kx-fg),.70)] group-hover:text-[rgba(var(--kx-fg),.90)]')}>
                <NavIcon name={it.icon} />
              </span>
              <span className="ml-2 tracking-tight">{it.label}</span>
              {on && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(var(--kx-accent), 0.95)' }} />}
            </Link>
          )
        })}
      </nav>

      {userEmail && (
        <div className="mt-auto px-5 py-4 " style={{ borderColor: 'rgba(var(--kx-border), .12)' }}>
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