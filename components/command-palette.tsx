'use client'

import { Command } from 'cmdk'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { navBottomItems, navMainItems } from './nav-items'

function fuzzyScore(text: string, query: string) {
  const t = text.toLowerCase()
  const q = query.toLowerCase().trim()
  if (!q) return 1
  let ti = 0
  let score = 0
  let consecutive = 0
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi]
    const found = t.indexOf(ch, ti)
    if (found === -1) return 0
    if (found === ti) {
      consecutive += 1
      score += 1.2 + consecutive * 0.2
    } else {
      consecutive = 0
      score += 0.9
    }
    ti = found + 1
  }
  return score / (t.length + 10)
}

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
    const quickNav = [
      { label: 'Open POS', href: '/sales/pos', group: 'Quick actions' },
      { label: 'New Quote', href: '/quotes/new', group: 'Quick actions' },
      { label: 'New Invoice', href: '/invoices/new', group: 'Quick actions' },
      { label: 'Record Payment', href: '/payments', group: 'Quick actions' },
      { label: 'Import Products', href: '/import-station', group: 'Quick actions' },
      { label: 'Open Buyers', href: '/buyers', group: 'Quick actions' },
    ]

    const allNav = [...navMainItems, ...navBottomItems]
      .filter((n) => n.href !== '/help')
      .map((n) => ({ label: n.label, href: n.href }))

    const core = [...quickNav, ...allNav].map((n) => ({
      type: 'nav' as const,
      label: n.label,
      hint: n.href,
      go: () => router.push(n.href),
    }))

    const quickActions = [
      { type: 'nav' as const, label: 'Open POS', hint: '/sales/pos', go: () => router.push('/sales/pos') },
      {
        type: 'action' as const,
        label: 'POS: Hold current sale',
        hint: 'Park ticket',
        go: () => window.dispatchEvent(new CustomEvent('kx:pos:hold')),
      },
      {
        type: 'action' as const,
        label: 'POS: Resume last held sale',
        hint: 'Restore ticket',
        go: () => window.dispatchEvent(new CustomEvent('kx:pos:resume')),
      },
      { type: 'nav' as const, label: 'New Invoice', hint: '/invoices/new', go: () => router.push('/invoices/new') },
      { type: 'nav' as const, label: 'New Client', hint: '/clients', go: () => router.push('/clients') },
      { type: 'nav' as const, label: 'New Quote', hint: '/quotes/new', go: () => router.push('/quotes/new') },
      { type: 'nav' as const, label: 'New Product', hint: '/products', go: () => router.push('/products') },
      { type: 'nav' as const, label: 'Open Buyers', hint: '/buyers', go: () => router.push('/buyers') },
    ]

    return [...quickActions, ...core]
  }, [router])

  if (!open) return null

  const results = actions
    .map((a) => ({ a, score: fuzzyScore(`${a.label} ${a.hint}`, search) }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, 14)
    .map((x) => x.a)

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 px-4 pt-[12vh]" onClick={() => setOpen(false)}>
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[rgba(var(--kx-border),.18)] bg-[rgba(var(--kx-shell),.95)] shadow-2xl backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
        <Command shouldFilter={false}>
          <div className="border-b border-[rgba(var(--kx-border),.12)] px-4 py-3">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Jump to clients, buyers, invoices…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[rgba(var(--kx-fg),.42)]"
            />
          </div>
          <Command.List className="max-h-[60vh] overflow-auto p-2">
            {results.length === 0 ? (
              <div className="px-3 py-6 text-sm kx-muted">No matches.</div>
            ) : (
              results.map((item) => (
                <Command.Item
                  key={`${item.label}-${item.hint}`}
                  value={`${item.label} ${item.hint}`}
                  onSelect={() => {
                    item.go()
                    setOpen(false)
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-2xl px-3 py-3 text-sm text-[rgba(var(--kx-fg),.92)] outline-none data-[selected=true]:bg-[rgba(var(--kx-fg),.07)]"
                >
                  <span>{item.label}</span>
                  <span className="text-xs kx-muted">{item.hint}</span>
                </Command.Item>
              ))
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
