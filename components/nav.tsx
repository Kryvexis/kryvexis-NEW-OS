'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@/lib/roles/shared'
import type { AppModule } from '@/lib/rbac-shared'
import { NAV } from '@/components/nav/nav-items'

function isAllowedByRole(itemRoles: UserRole[], role: UserRole) {
  return itemRoles.includes(role) || role === 'owner' || role === 'manager'
}

function iconFor(name: (typeof NAV)[number]['icon']) {
  // Minimal inline icons to avoid extra deps; replace with lucide if you want.
  // Using SVG keeps it stable for Vercel builds.
  const cls = 'h-4 w-4 opacity-90'
  switch (name) {
    case 'dashboard':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 13h7V4H4v9Zm9 7h7V11h-7v9ZM4 20h7v-5H4v5Zm9-11h7V4h-7v5Z" fill="currentColor" />
        </svg>
      )
    case 'pos':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 4h10a2 2 0 0 1 2 2v3H5V6a2 2 0 0 1 2-2Zm-2 7h14v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7Zm3 2v2h3v-2H8Zm0 3v2h3v-2H8Zm5-3v2h3v-2h-3Zm0 3v2h3v-2h-3Z" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6h12v12H6z" fill="currentColor" />
        </svg>
      )
  }
}

export function Sidebar({ role, modules }: { role: UserRole; modules: AppModule[] }) {
  const pathname = usePathname() || '/dashboard'
  const moduleSet = new Set(modules || [])

  const items = NAV.filter((it) => {
    const canByRole = isAllowedByRole(it.roles, role)
    const canByModule = !it.modules || it.modules.some((m) => moduleSet.has(m))
    return canByRole && canByModule
  })

  return (
    <aside
      className="hidden md:flex md:w-[260px] md:flex-col md:gap-2 md:px-3 md:py-4"
      style={{
        background:
          'linear-gradient(180deg, rgba(19,22,32,1) 0%, rgba(14,18,27,1) 55%, rgba(11,14,22,1) 100%)',
      }}
    >
      <div className="px-2 pb-2">
        <Link href="/dashboard" className="flex items-center gap-2 rounded-xl px-2 py-2 text-white/95 hover:bg-white/5">
          <Image src="/icons/icon-192.png" width={22} height={22} alt="Kryvexis OS" className="rounded-md" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Kryvexis OS</div>
            <div className="text-[11px] text-white/60">Business command center</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-1">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== '/dashboard' && pathname.startsWith(it.href))
          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                'group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium',
                active ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white',
              ].join(' ')}
            >
              <span className={active ? 'text-white' : 'text-white/70 group-hover:text-white'}>{iconFor(it.icon)}</span>
              <span className="flex-1 truncate">{it.label}</span>
              {active ? <span className="h-2 w-2 rounded-full bg-white/90" /> : null}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pt-2 text-[11px] text-white/45">© {new Date().getFullYear()} Kryvexis</div>
    </aside>
  )
}
