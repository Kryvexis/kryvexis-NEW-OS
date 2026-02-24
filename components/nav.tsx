'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

function Icon({ name }: { name: 'dashboard' | 'clients' | 'products' | 'suppliers' | 'quotes' | 'invoices' | 'payments' | 'accounts' | 'reports' | 'settings' | 'help' }) {
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
    case 'reports':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 20V4" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M5 18h15" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
          <path d="M8 16v-5M12 16v-8M16 16v-3" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
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

export const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' as const },
  { href: '/clients', label: 'Clients', icon: 'clients' as const },
  { href: '/products', label: 'Products', icon: 'products' as const },
  { href: '/suppliers', label: 'Suppliers', icon: 'suppliers' as const },
  { href: '/quotes', label: 'Quotes', icon: 'quotes' as const },
  { href: '/invoices', label: 'Invoices', icon: 'invoices' as const },
  { href: '/payments', label: 'Payments', icon: 'payments' as const },
  { href: '/accounts', label: 'Accounts', icon: 'accounts' as const },
  { href: '/reports', label: 'Reports', icon: 'reports' as const },
  { href: '/settings', label: 'Settings', icon: 'settings' as const },
  { href: '/help', label: 'Help', icon: 'help' as const },
]

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname() || ''
  return (
    <aside className="hidden md:flex md:w-[280px] md:flex-col border-r kx-hairline" style={{ background: 'rgba(8,11,20,.70)' }}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,.10)', background: 'rgba(255,255,255,.06)', boxShadow: '0 0 0 1px rgba(34,211,238,.10), 0 14px 40px rgba(0,0,0,.35)' }}>
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={64} height={64} className="h-12 w-12 object-contain" priority />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight">Kryvexis OS</div>
            <div className="text-xs text-white/50">v1.0.0</div>
          </div>
        </div>
      </div>

      <nav className="px-3 pb-4 space-y-1">
        {navItems.map((it) => {
          const on = pathname === it.href || pathname.startsWith(it.href + '/')
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                'group flex items-center gap-2 rounded-xl px-3 py-2 text-sm border transition ' +
                (on
                  ? 'border-white/14 bg-white/8 text-white'
                  : 'border-transparent hover:border-white/10 hover:bg-white/5 text-white/70')
              }
            >
              <span className={on ? 'text-white' : 'text-white/70 group-hover:text-white/90'}>
                <Icon name={it.icon} />
              </span>
              <span className="tracking-tight">{it.label}</span>
              {on && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(var(--kx-accent), 0.95)' }} />}
            </Link>
          )
        })}
      </nav>

      {userEmail && (
        <div className="mt-auto px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
          <div className="text-[11px] uppercase tracking-wider text-white/45">Signed in as</div>
          <div className="mt-1 text-xs text-white/80 break-all">{userEmail}</div>
        </div>
      )}
    </aside>
  )
}
