'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/lib/roles/shared'
import { canManageUsers } from '@/lib/roles/shared'

export function NavIcon({ name }: { name: 'sales' | 'buyers' | 'accounting' | 'operations' | 'insights' | 'settings' | 'help' | 'accountCenter' | 'upload' }) {
  const common = 'h-4 w-4'
  switch (name) {
    case 'sales':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
          <path d="M7 15l3-3 3 2 4-5" stroke="currentColor" strokeWidth="1.6" opacity="0.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'buyers':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 7h12l-1.2 9.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M9 7a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
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
  { href: '/sales', label: 'Sales', icon: 'sales' as const, roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'] as UserRole[] },
  { href: '/buyers', label: 'Buyers', icon: 'buyers' as const, roles: ['owner', 'manager', 'buyer'] as UserRole[] },
  { href: '/accounting', label: 'Accounting', icon: 'accounting' as const, roles: ['owner', 'manager', 'accounts'] as UserRole[] },
  { href: '/operations', label: 'Operations', icon: 'operations' as const, roles: ['owner', 'manager', 'buyer'] as UserRole[] },
  { href: '/insights', label: 'Insights', icon: 'insights' as const, roles: ['owner', 'manager'] as UserRole[] },
]

export const navBottomItems = [
  { href: '/settings', label: 'Settings', icon: 'settings' as const },
  { href: '/help', label: 'Help', icon: 'help' as const },
  { href: '/import-station', label: 'Import Center', icon: 'upload' as const },
  { href: '/account-center', label: 'Account Center', icon: 'accountCenter' as const },
]

export function Sidebar({ userEmail, workspaceName, role }: { userEmail?: string; workspaceName?: string; role: UserRole }) {
  const pathname = usePathname() || ''
  const widthCls = 'md:w-[280px]'

  return (
    <aside
      className={'hidden md:flex md:flex-col ' + widthCls}
      style={{
        background:
          'radial-gradient(120% 70% at 10% 0%, rgb(var(--kx-accent) / 0.20) 0%, transparent 40%), linear-gradient(180deg, #0e1726 0%, #0b1422 46%, #08111d 100%)',
        boxShadow: 'inset -1px 0 0 rgba(255,255,255,0.04), 18px 0 48px rgba(2,6,23,0.32)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className={'px-5 pt-5 pb-4'} style={{ color: 'rgba(255,255,255,0.94)' }}>
        <div className={'flex items-start justify-between gap-3'}>
          <div className={'flex flex-col'}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                <Image src="/kryvexis-logo.png" alt="Kryvexis" width={30} height={30} className="h-7 w-7 object-contain" priority />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight">Kryvexis OS</div>
                <div className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.58)' }}>
                  {workspaceName ?? 'Workspace'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className={'px-3 pb-2 space-y-1.5'} style={{ color: 'rgba(255,255,255,0.92)' }}>
        {navMainItems.filter((it) => it.roles.includes(role) || role === 'owner' || role === 'manager').map((it) => {
          const on = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link
              key={it.href}
              href={it.href}
              data-tour={`nav-${it.icon}`}
              title={it.label}
              className={'group relative flex items-center rounded-2xl border px-3 py-2.5 text-sm transition ' + (on ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]')}
              style={{ borderColor: on ? 'rgba(255,255,255,0.10)' : 'transparent' }}
            >
              {on && <span aria-hidden="true" className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full" style={{ background: 'rgb(var(--kx-accent))' }} />}
              <span className={'ml-1'} style={{ color: on ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.74)' }}>
                <NavIcon name={it.icon} />
              </span>
              <span className="ml-3 tracking-tight" style={{ color: on ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.88)' }}>
                {it.label}
              </span>
              {on && <span className="ml-auto h-2 w-2 rounded-full" style={{ background: 'rgb(var(--kx-accent))' }} />}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto" />
      <nav className={'px-3 pt-2 pb-3 space-y-1.5'} style={{ color: 'rgba(255,255,255,0.92)' }}>
        {navBottomItems.map((it) => {
          const on = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link
              key={it.href}
              href={it.href}
              title={it.label}
              className={'group relative flex items-center rounded-2xl border px-3 py-2.5 text-sm transition ' + (on ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]')}
              style={{ borderColor: on ? 'rgba(255,255,255,0.10)' : 'transparent' }}
            >
              {on && <span aria-hidden="true" className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full" style={{ background: 'rgb(var(--kx-accent))' }} />}
              <span className={'ml-1'} style={{ color: on ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.74)' }}>
                <NavIcon name={it.icon} />
              </span>
              <span className="ml-3 tracking-tight" style={{ color: on ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.88)' }}>
                {it.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {userEmail && (
        <div className="mt-auto px-5 py-4" style={{ color: 'rgba(255,255,255,0.90)' }}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  Signed in as
                </div>
                <div className="mt-1 text-xs break-all" style={{ color: 'rgba(255,255,255,0.90)' }}>
                  {userEmail}
                </div>
              </div>
              {canManageUsers(role) && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgb(var(--kx-accent) / 0.18)', color: 'rgba(255,255,255,0.94)', border: '1px solid rgb(var(--kx-accent) / 0.28)' }} title="Manager access">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
