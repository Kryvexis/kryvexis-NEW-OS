'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type ModuleTab = { href: string; label: string }

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

/**
 * Premium, compact sub-navigation used inside a module (Sales / Accounting / Operations / Insights).
 * Designed to reduce sidebar clutter while keeping fast access to related pages.
 */
export default function ModuleTabs({ tabs }: { tabs: ModuleTab[] }) {
  const pathname = usePathname() || ''

  return (
    <div className="kx-moduleTabs-wrap">
      <div className="kx-moduleTabs" role="tablist" aria-label="Section navigation">
        {tabs.map((t) => {
          const on = isActive(pathname, t.href)
          return (
            <Link
              key={t.href}
              href={t.href}
              role="tab"
              aria-selected={on}
              className={'kx-moduleTab ' + (on ? 'is-active' : '')}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
