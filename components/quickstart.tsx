'use client'

import Link from 'next/link'

export function QuickStart({ hasProducts, hasClients }: { hasProducts: boolean; hasClients: boolean }) {
  const steps = [
    { done: hasClients, title: 'Add clients', href: '/clients', tip: 'So you can quote & invoice in seconds.' },
    { done: hasProducts, title: 'Add products', href: '/products', tip: 'For quick item pick & barcode scanning.' },
    { done: false, title: 'Create a quote', href: '/quotes/new', tip: 'Pick client + items, then send.' },
    { done: false, title: 'Convert to invoice', href: '/quotes', tip: 'One click from an accepted quote.' },
    { done: false, title: 'Record a payment', href: '/payments', tip: 'Keeps balances accurate.' },
  ]
  return (
    <div className="kx-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Quick start</div>
          <div className="mt-1 text-xs text-white/60">Most people learn Kryvexis OS in under 10 minutes. Start here.</div>
        </div>
        <span className="kx-chip">Simple mode</span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {steps.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-white/[0.02] px-3 py-2 hover:bg-white/[0.04]"
          >
            <div className="min-w-0">
              <div className="text-sm">
                <span className={s.done ? 'text-emerald-200' : 'text-white/90'}>{s.done ? '✓ ' : '• '}{s.title}</span>
              </div>
              <div className="text-xs text-white/55 truncate">{s.tip}</div>
            </div>
            <span className="text-xs text-white/55">Open</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
