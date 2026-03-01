'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = { href: string; label: string }

function cx(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(' ')
}

export default function ModuleTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname()
  const active = (href: string) => pathname === href || pathname.startsWith(href + '/')
  return (
    <div className="kx-tabsWrap">
      <div className="kx-tabs">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cx('kx-tab', active(t.href) && 'kx-tabActive')}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
