import Link from 'next/link'

export function RightRail({
  title = 'Activity',
  items = [],
  actions = [],
}: {
  title?: string
  items?: { label: string; sub?: string; href?: string }[]
  actions?: { label: string; href: string }[]
}) {
  return (
    <div className="space-y-4">
      <div className="kx-card p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{title}</div>
          {actions?.length ? (
            <div className="flex items-center gap-2">
              {actions.slice(0, 2).map((a) => (
                <Link key={a.href} href={a.href} className="kx-btn kx-btn-ghost">
                  {a.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          {items.length ? (
            items.slice(0, 6).map((it, idx) => (
              <div key={idx} className="kx-railItem">
                {it.href ? (
                  <Link href={it.href} className="kx-railItemTitle">
                    {it.label}
                  </Link>
                ) : (
                  <div className="kx-railItemTitle">{it.label}</div>
                )}
                {it.sub ? <div className="kx-railItemSub">{it.sub}</div> : null}
              </div>
            ))
          ) : (
            <div className="text-sm text-white/[0.55]">Nothing yet. When you create quotes, invoices or payments, they’ll show up here.</div>
          )}
        </div>
      </div>

      <div className="kx-card p-5">
        <div className="text-sm font-semibold">Quick actions</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href="/sales/pos" className="kx-btn kx-btn-secondary">Open POS</Link>
          <Link href="/sales/quotes/new" className="kx-btn kx-btn-secondary">New quote</Link>
          <Link href="/sales/invoices/new" className="kx-btn kx-btn-secondary">New invoice</Link>
          <Link href="/accounting/payments" className="kx-btn kx-btn-secondary">Payments</Link>
        </div>
      </div>
    </div>
  )
}
