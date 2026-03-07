'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/lib/roles/shared'
import { canManageUsers } from '@/lib/roles/shared'
import { navBottomItems, navMainItems, type NavIconName } from './nav-items'

export function NavIcon({ name }: { name: NavIconName }) {
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
          <path d="M6 7h12l-1.2 6.5a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L6 7Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9" strokeLinejoin="round"/>
          <path d="M8 7V6a4 4 0 0 1 8 0v1" stroke="currentColor" strokeWidth="1.5" opacity="0.5" strokeLinecap="round"/>
          <circle cx="9" cy="19" r="1.25" fill="currentColor" opacity="0.9"/>
          <circle cx="15" cy="19" r="1.25" fill="currentColor" opacity="0.9"/>
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
      return <span aria-hidden="true">⬆️</span>
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

export function Sidebar({ userEmail, workspaceName, role }: { userEmail?: string; workspaceName?: string; role: UserRole }) {
  const pathname = usePathname() || ''
  const widthCls = 'md:w-[276px]'

  return (
    <aside
      className={'hidden md:flex md:flex-col ' + widthCls}
      style={{
        background:
          'linear-gradient(180deg, rgb(var(--kx-accent) / 0.24) 0%, rgb(var(--kx-accent) / 0.10) 18%, #0b1220 40%, #0a1628 70%, #081324 100%)',
        boxShadow: 'var(--kx-shadow-sidebar)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className={'px-5 pt-5 pb-3'} style={{ color: 'rgba(255,255,255,0.92)' }}>
        <div className={'flex items-start justify-between gap-3'}>
          <div className={'flex flex-col'}>
            <div className="flex items-center gap-2">
              <Image
                src="/kryvexis-logo.png"
                alt="Kryvexis"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                style={{ filter: 'drop-shadow(0 10px 22px rgba(0,0,0,.35))' }}
                priority
              />
              <div>
                <div className="text-sm font-semibold tracking-tight">Kryvexis OS</div>
                <div className="text-[11px] leading-tight" style={{ color: 'rgba(255,255,255,0.62)' }}>
                  {workspaceName ?? 'Workspace'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className={'px-3 pb-2 space-y-1'} style={{ color: 'rgba(255,255,255,0.92)' }}>
        {navMainItems
          .filter((it) => !it.roles || it.roles.includes(role) || role === 'owner' || role === 'manager')
          .map((it) => {
            const on = pathname === it.href || pathname.startsWith(it.href + '/')
            return (
              <Link
                key={it.href}
                href={it.href}
                data-tour={`nav-${it.icon}`}
                title={it.label}
                className={
                  'group relative flex items-center rounded-xl py-2 text-sm transition ' +
                  (on ? 'bg-white/10' : 'hover:bg-white/5')
                }
              >
                {on && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                    style={{ background: 'rgb(var(--kx-accent))' }}
                  />
                )}

                <span className={'ml-3'} style={{ color: on ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.74)' }}>
                  <NavIcon name={it.icon} />
                </span>
                <span
                  className="ml-2 tracking-tight"
                  style={{ color: on ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.88)' }}
                >
                  {it.label}
                </span>
                {on && <span className="ml-auto mr-2 h-1.5 w-1.5 rounded-full" style={{ background: 'rgb(var(--kx-accent))' }} />}
              </Link>
            )
          })}
      </nav>

      <div className="mt-auto" />
      <nav className={'px-3 pt-2 pb-3 space-y-1'} style={{ color: 'rgba(255,255,255,0.92)' }}>
        {navBottomItems
          .filter((it) => !it.roles || it.roles.includes(role) || role === 'owner' || role === 'manager')
          .map((it) => {
            const on = pathname === it.href || pathname.startsWith(it.href + '/')
            return (
              <Link
                key={it.href}
                href={it.href}
                title={it.label}
                className={
                  'group relative flex items-center rounded-xl py-2 text-sm transition ' +
                  (on ? 'bg-white/10' : 'hover:bg-white/5')
                }
              >
                {on && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full"
                    style={{ background: 'rgb(var(--kx-accent))' }}
                  />
                )}

                <span className={'ml-3'} style={{ color: on ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.74)' }}>
                  <NavIcon name={it.icon} />
                </span>
                <span
                  className="ml-2 tracking-tight"
                  style={{ color: on ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.88)' }}
                >
                  {it.label}
                </span>
                {on && <span className="ml-auto mr-2 h-1.5 w-1.5 rounded-full" style={{ background: 'rgb(var(--kx-accent))' }} />}
              </Link>
            )
          })}
      </nav>

      {userEmail && (
        <div className="mt-auto px-5 py-4" style={{ color: 'rgba(255,255,255,0.90)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.52)' }}>
                Signed in as
              </div>
              <div className="mt-1 text-xs break-all" style={{ color: 'rgba(255,255,255,0.90)' }}>
                {userEmail}
              </div>
            </div>
            {canManageUsers(role) && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                style={{ background: 'rgb(var(--kx-accent) / 0.16)', color: 'rgba(255,255,255,0.92)', border: '1px solid rgb(var(--kx-accent) / 0.28)' }}
                title="Manager access"
              >
                Admin
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
