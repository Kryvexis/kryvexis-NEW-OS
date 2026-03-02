import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { ChevronRight } from 'lucide-react'

type SP = { tab?: string }

export default async function MobileBuyers({ searchParams }: { searchParams: Promise<SP> | SP }) {
  const sp: SP = (await (searchParams as any)) || {}
  const tab = String(sp.tab || 'low')

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: products } = await supabase
    .from('products')
    .select('id,name,type,stock_on_hand,low_stock_threshold,is_active')
    .eq('company_id', companyId)
    .limit(5000)

  const prods = (products || []).filter((p: any) => p.type === 'product' && p.is_active !== false)
  const low = prods.filter((p: any) => Number(p.stock_on_hand || 0) <= Number(p.low_stock_threshold || 0))
  const out = prods.filter((p: any) => Number(p.stock_on_hand || 0) <= 0)

  const list = tab === 'out' ? out : tab === 'recent' ? [] : low

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[13px] kx-muted">Buyers</div>
          <div className="kx-h1">Stock & Reorder</div>
        </div>
        <Link href="/operations/stock" className="text-sm font-semibold text-[rgb(var(--kx-accent))]">
          Full stock
        </Link>
      </div>

      <div className="mt-4 rounded-3xl bg-[rgba(var(--kx-surface),1)] shadow-[var(--kx-shadow-card)] p-2"
        style={{ border: '1px solid rgb(var(--kx-border) / 0.06)' }}>
        <div className="grid grid-cols-3 gap-2">
          <Tab href="/m/buyers?tab=low" active={tab === 'low'} label={`Low Stock (${low.length})`} />
          <Tab href="/m/buyers?tab=out" active={tab === 'out'} label={`Out (${out.length})`} />
          <Tab href="/m/buyers?tab=recent" active={tab === 'recent'} label="Recent" />
        </div>
      </div>

      <div className="mt-4">
        <div className="rounded-3xl bg-[rgba(var(--kx-surface),1)] shadow-[var(--kx-shadow-card)]"
          style={{ border: '1px solid rgb(var(--kx-border) / 0.06)' }}>
          {tab === 'recent' ? (
            <div className="p-5">
              <div className="text-sm font-semibold">Recently reordered</div>
              <div className="mt-2 text-sm kx-muted">
                Coming next: we’ll log purchase orders, then show a “recently reordered” feed + supplier batching.
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="p-5 text-sm kx-muted">Nothing here 🎉</div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgb(var(--kx-border) / 0.06)' }}>
              {list.slice(0, 60).map((p: any) => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="text-xs kx-muted">
                      On hand: <b>{Number(p.stock_on_hand || 0)}</b>
                      {tab === 'low' ? ` · Reorder: ${Number(p.low_stock_threshold || 0)}` : ''}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 kx-muted" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-[rgba(var(--kx-surface),1)] shadow-[var(--kx-shadow-card)] p-4"
        style={{ border: '1px solid rgb(var(--kx-border) / 0.06)' }}>
        <div className="text-sm font-semibold">Next up: Review & Order</div>
        <div className="mt-1 text-sm kx-muted">
          We’ll add a purchase list, group by supplier, auto-generate order emails, and log purchase orders for history.
        </div>
        <div className="mt-3 flex gap-2">
          <Link href="/operations/suppliers" className="px-4 py-2 rounded-2xl bg-black/5 text-sm font-semibold">Suppliers</Link>
          <Link href="/operations/stock" className="px-4 py-2 rounded-2xl bg-black/5 text-sm font-semibold">Stock</Link>
        </div>
      </div>

      <div className="h-10" />
    </div>
  )
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        'rounded-2xl px-3 py-2 text-center text-xs font-semibold transition ' +
        (active ? 'bg-[rgb(var(--kx-accent)/0.12)] text-[rgb(var(--kx-accent))]' : 'bg-black/5 text-[rgb(var(--kx-muted))]')
      }
    >
      {label}
    </Link>
  )
}
