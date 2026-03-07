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
      { label: 'Open POS', href: '/sales/pos' },
      { label: 'New Quote', href: '/quotes/new' },
      { label: 'New Invoice', href: '/invoices/new' },
      { label: 'Record Payment', href: '/payments' },
      { label: 'Import Products', href: '/import-station' },
      { label: 'Open Buyers', href: '/buyers' },
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
      { type: 'action' as const, label: 'POS: Hold current sale', hint: 'Park ticket', go: () => window.dispatchEvent(new CustomEvent('kx:pos:hold')) },
      { type: 'action' as const, label: 'POS: Resume last held sale', hint: 'Restore ticket', go: () => window.dispatchEvent(new CustomEvent('kx:pos:resume')) },
      { type: 'nav' as const, label: 'New Invoice', hint: '/invoices/new', go: () => router.push('/invoices/new') },
      { type: 'nav' as const, label: 'New Client', hint: '/clients', go: () => router.push('/clients') },
      { type: 'nav' as const, label: 'New Quote', hint: '/quotes/new', go: () => router.push('/quotes/new') },
      { type: 'nav' as const, label: 'New Product', hint: '/operations/products', go: () => router.push('/operations/products') },
      { type: 'nav' as const, label: 'Open Buyers', hint: '/buyers', go: () => router.push('/buyers') },
    ]

    return [...quickActions, ...core]
  }, [router])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <div className="absolute left-1/2 top-20 w-[92vw] max-w-2xl -translate-x-1/2 rounded-3xl border border-[rgba(var(--kx-border),.12)] bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden">
        <Command className="p-2" value={search} onValueChange={setSearch} filter={(value, query) => Math.floor(fuzzyScore(value, query) * 1000)}>
          <div className="px-3 pt-3 pb-2">
            <Command.Input autoFocus placeholder="Search or type a command…" className="w-full rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] px-3 py-2 text-sm outline-none" />
            <div className="mt-2 text-[11px] text-[rgba(var(--kx-fg),.92)]/50">Tip: Ctrl/⌘ K to open · Enter to run</div>
          </div>
          <Command.List className="max-h-[60vh] overflow-auto px-2 pb-2">
            <Command.Empty className="px-3 py-4 text-sm kx-muted">No results.</Command.Empty>
            <Command.Group heading="Quick actions" className="kx-muted text-xs px-2">
              {actions.map((a) => (
                <Command.Item key={`${a.label}-${a.hint}`} value={`${a.label} ${a.hint}`} className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-[rgba(var(--kx-fg),.92)]/85 aria-selected:bg-[rgba(var(--kx-border),.10)]" onSelect={() => { a.go(); setOpen(false); setSearch('') }}>
                  <span>{a.label}</span>
                  <span className="text-xs text-[rgba(var(--kx-fg),.92)]/50">{a.hint}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
