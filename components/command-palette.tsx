'use client'

import { Command } from 'cmdk'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { navItems } from './nav'

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k'
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const actions = useMemo(() => {
    const core = navItems.map((n) => ({
      type: 'nav' as const,
      label: n.label,
      hint: n.href,
      go: () => router.push(n.href),
    }))

    const quick = [
      { type: 'nav' as const, label: 'New Quote', hint: '/quotes/new', go: () => router.push('/quotes/new') },
      { type: 'nav' as const, label: 'New Invoice', hint: '/invoices/new', go: () => router.push('/invoices/new') },
      { type: 'nav' as const, label: 'Add Client', hint: '/clients', go: () => router.push('/clients') },
      { type: 'nav' as const, label: 'Add Product', hint: '/products', go: () => router.push('/products') },
    ]

    return [...quick, ...core]
  }, [router])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <div className="absolute left-1/2 top-20 w-[92vw] max-w-2xl -translate-x-1/2 rounded-3xl border border-white/10 bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden">
        <Command className="p-2" value={search} onValueChange={setSearch}>
          <div className="px-3 pt-3 pb-2">
            <Command.Input
              autoFocus
              placeholder="Search or type a command…"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none"
            />
            <div className="mt-2 text-[11px] text-white/50">Tip: Ctrl/⌘ K to open · Enter to run</div>
          </div>

          <Command.List className="max-h-[60vh] overflow-auto px-2 pb-2">
            <Command.Empty className="px-3 py-4 text-sm text-white/60">No results.</Command.Empty>
            <Command.Group heading="Quick actions" className="text-white/60 text-xs px-2">
              {actions.map((a) => (
                <Command.Item
                  key={`${a.label}-${a.hint}`}
                  className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-white/85 aria-selected:bg-white/10"
                  onSelect={() => { a.go(); setOpen(false); setSearch('') }}
                >
                  <span>{a.label}</span>
                  <span className="text-xs text-white/50">{a.hint}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
