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
      {/* Mobile: horizontal scroll instead of wrapping (prevents the “cramped pill” look) */}
      <div className="max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <div className="inline-flex min-w-max flex-nowrap items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-1 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,.25)]">
          {tabs.map((t) => {
            const isActive = active(t.href)
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cx(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] sm:px-3.5 sm:py-1.5 sm:text-sm transition',
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
      <div className="mt-2 text-[11px] kx-muted2 md:hidden">Tip: swipe the tabs left/right.</div>
    </div>
  )
}
