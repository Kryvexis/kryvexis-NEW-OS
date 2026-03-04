'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/lib/roles/shared'
import { canManageUsers } from '@/lib/roles/shared'
import type { AppModule } from '@/lib/rbac-shared'

export function NavIcon({ name }: { name: 'sales' | 'accounting' | 'operations' | 'insights' | 'settings' | 'help' | 'accountCenter' | 'upload' | 'procurement' }) {
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

const navMainItems = [
  { href: '/sales', label: 'Sales', icon: 'sales' as const, module: 'sales' as AppModule },
  { href: '/buyers', label: 'Procurement', icon: 'procurement' as const, module: 'procurement' as AppModule },
  { href: '/accounting/dashboard', label: 'Accounting', icon: 'accounting' as const, module: 'accounting' as AppModule },
  { href: '/operations', label: 'Operations', icon: 'operations' as const, module: 'operations' as AppModule },
  { href: '/insights', label: 'Insights', icon: 'insights' as const, module: 'insights' as AppModule },
]

const navBottomItems = [
  { href: '/settings', label: 'Settings', icon: 'settings' as const, module: 'settings' as AppModule },
  { href: '/help', label: 'Help', icon: 'help' as const, module: 'settings' as AppModule },
  { href: '/import-station', label: 'Import Center', icon: 'upload' as const, module: 'operations' as AppModule },
  { href: '/account-center', label: 'Account Center', icon: 'accountCenter' as const, module: 'settings' as AppModule },
]

export function Sidebar({ userEmail, workspaceName, role, modules }: { userEmail?: string; workspaceName?: string; role: UserRole; modules: AppModule[] }) {
  const pathname = usePathname() || ''
  const canSee = (module: AppModule) => role === 'owner' || role === 'manager' || modules.includes(module)

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
          <Image src="/kryvexis-logo.png" alt="Kryvexis" width={32} height={32} className="h-8 w-8 object-contain" priority />
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">Kryvexis OS</div>
            <div className="text-[11px] text-white/65">{workspaceName ?? 'Workspace'}</div>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-3 pb-2 text-white/90">
        {navMainItems.filter((it) => canSee(it.module)).map((it) => {
          const on = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link key={it.href} href={it.href} className={'group relative flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'bg-white/16' : 'hover:bg-white/8')}>
              {on && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-white" />}
              <span className="ml-3 text-white/90"><NavIcon name={it.icon} /></span>
              <span className="ml-2 tracking-tight text-white">{it.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto" />
      <nav className="space-y-1 px-3 pb-3 pt-2 text-white/90">
        {navBottomItems.filter((it) => canSee(it.module)).map((it) => {
          const on = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link key={it.href} href={it.href} className={'group relative flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'bg-white/16' : 'hover:bg-white/8')}>
              {on && <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-white" />}
              <span className="ml-3 text-white/90"><NavIcon name={it.icon} /></span>
              <span className="ml-2 tracking-tight text-white">{it.label}</span>
            </Link>
          )
        })}
      </nav>

      {userEmail && (
        <div className="px-5 py-4 text-white/90">
          <div className="text-[11px] uppercase tracking-wider text-white/55">Signed in as</div>
          <div className="mt-1 break-all text-xs text-white/90">{userEmail}</div>
          {canManageUsers(role) ? <span className="mt-2 inline-flex rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-xs text-white">Admin</span> : null}
        </div>
      )}
    </aside>
  )
}
