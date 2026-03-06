'use client'

import { useMemo, useState } from 'react'
import { navBottomItems, navMainItems } from './nav-items'

export default function Topbar() {
  const [q, setQ] = useState('')
  const placeholder = useMemo(() => {
    const labels = [...navMainItems, ...navBottomItems]
      .filter((n) => n.href !== '/help')
      .map((n) => n.label)
      .join(', ')
    return `Search ${labels}`
  }, [])

  return (
    <div className="flex h-16 items-center gap-3 px-4 md:px-5 kx-topbar-surface">
      <div className="md:hidden text-sm font-semibold tracking-tight">Kryvexis OS</div>
      <div className="hidden md:block">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] kx-muted2">Workspace</div>
        <div className="text-sm font-semibold text-kx-fg">Command Center</div>
      </div>
      <div className="flex-1" />
      <div className="relative w-full max-w-xl">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="kx-input h-12 pr-16"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[11px] text-[rgba(var(--kx-fg),.50)]">
          <span className="kx-badge px-1.5 py-0.5">Ctrl</span>
          <span className="kx-badge px-1.5 py-0.5">K</span>
        </div>
      </div>
    </div>
  )
}
