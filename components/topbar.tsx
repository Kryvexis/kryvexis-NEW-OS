'use client'

import { useMemo, useState } from 'react'
import { navBottomItems, navMainItems } from './nav'

export default function Topbar() {
  const [q, setQ] = useState('')
  const placeholder = useMemo(() => {
    const labels = [...navMainItems, ...navBottomItems]
      .filter((n) => n.href !== '/help')
      .map((n) => n.label)
      .join(', ')
    return `Search: ${labels}`
  }, [])

  return (
    <div className="h-14 flex items-center gap-3 px-4 border-b kx-hairline kx-surface">
      <div className="md:hidden font-semibold tracking-tight">Kryvexis OS</div>
      <div className="flex-1" />
      <div className="w-full max-w-md relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="kx-input pr-16"
        />
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[11px] text-[rgba(var(--kx-fg),.50)]">
          <span className="kx-badge px-1.5 py-0.5">Ctrl</span>
          <span className="kx-badge px-1.5 py-0.5">K</span>
        </div>
      </div>
    </div>
  )
}
