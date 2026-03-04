'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { AppModule, UserRole } from '@/lib/roles/shared'
import { canManageUsers } from '@/lib/roles/shared'

export function NavIcon({
  name,
}: {
  name:
    | 'sales'
    | 'accounting'
    | 'operations'
    | 'insights'
    | 'settings'
    | 'help'
    | 'accountCenter'
    | 'upload'
    | 'procurement'
}) {
  const common = 'h-4 w-4'
  switch (name) {
    case 'procurement':
      return <span className={common}>🛒</span>
    case 'sales':
      return <span className={common}>📈</span>
    case 'accounting':
      return <span className={common}>🧾</span>
    case 'operations':
      return <span className={common}>📦</span>
    case 'insights':
      return <span className={common}>📊</span>
    case 'accountCenter':
      return <span className={common}>👤</span>
    case 'upload':
      return <span className={common}>⬆️</span>
    case 'help':
      return <span className={common}>❓</span>
    case 'settings':
      return <span className={common}>⚙️</span>
  }
}

type SidebarItem = {
  href: string
  label: string
  icon: Parameters<typeof NavIcon>[0]['name']
  roles?: UserRole[]
  modules?: AppModule[]
}

export const navMainItems: readonly SidebarItem[] = [
  { href: '/sales', label: 'Sales', icon: 'sales', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'], modules: ['sales'] },
  { href: '/buyers', label: 'Procurement', icon: 'procurement', roles: ['owner', 'manager', 'buyer'], modules: ['procurement'] },
  { href: '/accounting', label: 'Accounting', icon: 'accounting', roles: ['owner', 'manager', 'accounts'], modules: ['accounting'] },
  { href: '/operations', label: 'Operations', icon: 'operations', roles: ['owner', 'manager', 'buyer'], modules: ['operations'] },
  { href: '/insights', label: 'Insights', icon: 'insights', roles: ['owner', 'manager'], modules: ['insights'] },
]

export const navBottomItems: readonly SidebarItem[] = [
  { href: '/settings', label: 'Settings', icon: 'settings', modules: ['settings'] },
  { href: '/help', label: 'Help', icon: 'help' },
  { href: '/import-station', label: 'Import Center', icon: 'upload', modules: ['operations'] },
  { href: '/account-center', label: 'Account Center', icon: 'accountCenter', modules: ['settings'] },
]

export function Sidebar({
  userEmail,
  workspaceName,
  role,
  modules,
}: {
  userEmail?: string
  workspaceName?: string
  role: UserRole
  modules: AppModule[]
}) {
  const pathname = usePathname() || ''
  const moduleSet = new Set<AppModule>(modules || [])

  return (
    <aside
      className="hidden md:flex md:w-[276px] md:flex-col"
      style={{
        background: 'linear-gradient(180deg, rgb(var(--kx-accent) / 0.26) 0%, rgb(var(--kx-accent) / 0.14) 14%, #0b1220 44%, #081324 100%)',
        boxShadow: 'var(--kx-shadow-sidebar)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="px-5 pb-3 pt-5 text-white/90">
        <div className="flex items-center gap-2">
          <Image
            src="/kryvexis-logo.png"
            alt="Kryvexis"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">Kryvexis OS</div>
            <div className="text-[11px] text-white/65">{workspaceName ?? 'Workspace'}</div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className={'px-3 pb-2 space-y-1'} style={{ color: 'rgba(255,255,255,0.92)' }}>
        {navMainItems
          .filter(
            (it) =>
              (!it.roles || it.roles.includes(role) || role === 'owner' || role === 'manager') &&
              (!it.modules || it.modules.some((m) => moduleSet.has(m))),
          )
          .map((it) => {
            const on = pathname === it.href || pathname.startsWith(it.href + '/')
            return (
              <Link
                key={it.href}
                href={it.href}
                className={'group relative flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'bg-white/16' : 'hover:bg-white/8')}
              >
                {on && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-white" />}
                <span className="ml-3 text-white/90">
                  <NavIcon name={it.icon} />
                </span>
                <span className="ml-2 tracking-tight text-white">{it.label}</span>
              </Link>
            )
          })}
      </nav>

      <div className="mt-auto" />

      <nav className={'px-3 pt-2 pb-3 space-y-1'} style={{ color: 'rgba(255,255,255,0.92)' }}>
        {navBottomItems
          .filter((it) => !it.modules || it.modules.some((m) => moduleSet.has(m)))
          .map((it) => {
            const on = pathname === it.href || pathname.startsWith(it.href + '/')
            return (
              <Link
                key={it.href}
                href={it.href}
                className={'group relative flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'bg-white/16' : 'hover:bg-white/8')}
              >
                {on && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-white" />}
                <span className="ml-3 text-white/90">
                  <NavIcon name={it.icon} />
                </span>
                <span className="ml-2 tracking-tight text-white">{it.label}</span>
              </Link>
            )
          })}
      </nav>

      {userEmail && (
        <div className="px-5 py-4 text-white/90">
          <div className="text-[11px] uppercase tracking-wider text-white/55">Signed in as</div>
          <div className="mt-1 break-all text-xs text-white/90">{userEmail}</div>
          {canManageUsers(role) ? (
            <span className="mt-2 inline-flex rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-xs text-white">
              Admin
            </span>
          ) : null}
        </div>
      )}
    </aside>
  )
}
