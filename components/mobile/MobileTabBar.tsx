'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBasket, TrendingUp, Settings, Plus } from 'lucide-react'
import clsx from 'clsx'

type Tab = {
  href: string
  label: string
  icon: any
}

const TABS: Tab[] = [
  { href: '/m/home', label: 'Home', icon: Home },
  { href: '/m/buyers', label: 'Buyers', icon: ShoppingBasket },
  { href: '/m/sales', label: 'Sales', icon: TrendingUp },
  { href: '/m/settings', label: 'Settings', icon: Settings },
]

export default function MobileTabBar() {
  const pathname = usePathname() || ''
  const active = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    // Always float above content on mobile.
    <div className="fixed inset-x-0 bottom-0 z-[9999]">
      {/*
        Safe-area padding so the bar doesn't sit under iOS home indicator.
        The outer wrapper provides the spacing; inner card stays floating.
      */}
      <div className="mx-auto w-full max-w-md px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div
          className="relative rounded-[28px] bg-[rgba(var(--kx-surface),0.88)] backdrop-blur-md shadow-[var(--kx-shadow-float)]"
          style={{ border: '1px solid rgb(var(--kx-border) / 0.08)' }}
        >
          {/* Floating primary action */}
          <Link
            href="/sales/pos"
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
            aria-label="New sale"
          >
            <div className="h-14 w-14 rounded-2xl bg-[rgb(var(--kx-accent))] text-white shadow-[var(--kx-shadow-float)] grid place-items-center">
              <Plus className="h-6 w-6" />
            </div>
          </Link>

          <div className="grid grid-cols-4 gap-1 px-2 py-2">
            {TABS.map((t) => {
              const Icon = t.icon
              const isActive = active(t.href)
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={clsx(
                    'flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[11px] transition',
                    isActive
                      ? 'bg-[rgb(var(--kx-accent)/0.12)] text-[rgb(var(--kx-accent))]'
                      : 'text-[rgb(var(--kx-muted))] hover:bg-black/5'
                  )}
                >
                  <Icon className={clsx('h-5 w-5', isActive ? '' : 'opacity-90')} />
                  <span className={clsx(isActive ? 'font-semibold' : '')}>{t.label}</span>
                </Link>
              )}
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
