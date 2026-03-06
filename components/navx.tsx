'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/lib/roles/shared'
import { canManageUsers } from '@/lib/roles/shared'

export function NavIcon({ name }: { name: 'sales' | 'accounting' | 'operations' | 'buyers' | 'insights' | 'settings' | 'help' | 'accountCenter' | 'upload' }) {
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
    case 'buyers':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h2l2.2 8.2a1 1 0 0 0 1 .8h7.7a1 1 0 0 0 1-.8L20 9H8" stroke="currentColor" strokeWidth="1.5" opacity="0.9" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="10" cy="19" r="1.3" fill="currentColor" opacity="0.9" />
          <circle cx="17" cy="19" r="1.3" fill="currentColor" opacity="0.9" />
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
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 16V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="m8.5 10.5 3.5-3.5 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 19h14" stroke="currentColor" strokeWidth="1.5" opacity="0.45" strokeLinecap="round" />
        </svg>
      )
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
  { href: '/accounting', label: 'Accounting', icon: 'accounting' as const, roles: ['owner', 'manager', 'accounts'] as UserRole[] },
  { href: '/operations', label: 'Operations', icon: 'operations' as const, roles: ['owner', 'manager', 'buyer'] as UserRole[] },
  { href: '/buyers', label: 'Buyers', icon: 'buyers' as const, roles: ['owner', 'manager', 'buyer'] as UserRole[] },
  { href: '/insights', label: 'Insights', icon: 'insights' as const, roles: ['owner', 'manager'] as UserRole[] },
]

export const navBottomItems = [
  { href: '/settings', label: 'Settings', icon: 'settings' as const },
  { href: '/help', label: 'Help', icon: 'help' as const },
  { href: '/import-station', label: 'Import Center', icon: 'upload' as const },
  { href: '/account-center', label: 'Account Center', icon: 'accountCenter' as const },
]

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      className={
        'group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all duration-150 ' +
        (active ? 'bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'hover:bg-white/6')
      }
    >
      {active && (
        <span aria-hidden="true" className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white/90" />
      )}
      <span className={active ? 'text-white' : 'text-white/70'}>
        <NavIcon name={icon} />
      </span>
      <span className={active ? 'font-medium tracking-tight text-white' : 'tracking-tight text-white/86'}>{label}</span>
      {active ? <span className="ml-auto h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.85)]" /> : null}
    </Link>
  )
}

export function Sidebar({ userEmail, workspaceName, role }: { userEmail?: string; workspaceName?: string; role: UserRole }) {
  const pathname = usePathname() || ''

  return (
    <aside
      className="hidden md:flex md:w-[290px] md:flex-col"
      style={{
        background:
          'radial-gradient(circle at top left, rgba(99,102,241,0.30), transparent 30%), linear-gradient(180deg, #111827 0%, #0f172a 38%, #08111f 100%)',
        boxShadow: 'var(--kx-shadow-sidebar)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="px-5 pb-4 pt-5 text-white">
        <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={40} height={40} className="h-10 w-10 rounded-xl object-contain" priority />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">Kryvexis OS</div>
              <div className="truncate text-[11px] text-white/60">{workspaceName ?? 'Workspace'}</div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Workspace pulse</div>
            <div className="mt-1 text-sm text-white/88">Ready for sales, invoicing, and ops</div>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-3 pb-3 text-white">
        {navMainItems
          .filter((it) => it.roles.includes(role) || role === 'owner' || role === 'manager')
          .map((it) => (
            <NavLink key={it.href} href={it.href} label={it.label} icon={it.icon} active={pathname === it.href || pathname.startsWith(it.href + '/')} />
          ))}
      </nav>

      <div className="mx-5 my-3 h-px bg-white/8" />

      <nav className="space-y-1 px-3 pb-4 text-white">
        {navBottomItems.map((it) => (
          <NavLink key={it.href} href={it.href} label={it.label} icon={it.icon} active={pathname === it.href || pathname.startsWith(it.href + '/')} />
        ))}
      </nav>

      <div className="mt-auto px-5 pb-5 pt-2 text-white">
        <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">Signed in</div>
              <div className="mt-1 break-all text-xs text-white/88">{userEmail}</div>
            </div>
            {canManageUsers(role) && (
              <span className="inline-flex items-center rounded-full border border-cyan-300/25 bg-cyan-400/10 px-2 py-0.5 text-[11px] text-cyan-100">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
