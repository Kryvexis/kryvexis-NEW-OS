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
    <div className="mt-3 mb-3">
      <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-1 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,.25)]">
        {tabs.map((t) => {
          const isActive = active(t.href)
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cx(
                'rounded-full px-3.5 py-1.5 text-sm transition',
                'text-white/70 hover:text-white',
                'hover:bg-white/6',
                isActive && 'bg-white/10 text-white border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]'
              )}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
