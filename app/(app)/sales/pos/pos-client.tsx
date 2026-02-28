'use client'

import * as React from 'react'

type Product = {
  id: string
  name: string
  sku: string
  price: number
  tag: string
}

type CartLine = {
  product: Product
  qty: number
}

const PRODUCTS: Product[] = [
  { id: 'p1', name: '12mm Conduit (3m)', sku: 'CON-12-3M', price: 39.9, tag: 'Conduit' },
  { id: 'p2', name: '2.5mm Twin + Earth (1m)', sku: 'CAB-25-TE', price: 18.5, tag: 'Cable' },
  { id: 'p3', name: '20A Circuit Breaker', sku: 'CB-20A', price: 89.0, tag: 'Breaker' },
  { id: 'p4', name: 'Double Socket (White)', sku: 'SOC-DBL-W', price: 55.0, tag: 'Sockets' },
  { id: 'p5', name: 'LED Downlight 7W', sku: 'LED-DL-7W', price: 74.0, tag: 'Lighting' },
  { id: 'p6', name: 'Wall Switch 1G', sku: 'SW-1G', price: 24.0, tag: 'Switches' },
  { id: 'p7', name: 'Junction Box 100x100', sku: 'JB-100', price: 29.0, tag: 'Accessories' },
  { id: 'p8', name: 'Earth Leakage 63A', sku: 'EL-63A', price: 599.0, tag: 'Safety' },
]

function currencyZAR(n: number) {
  try {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n)
  } catch {
    return `R ${n.toFixed(2)}`
  }
}

export default function POSClient() {
  const [query, setQuery] = React.useState('')
  const [activeTag, setActiveTag] = React.useState<string>('All')
  const [cart, setCart] = React.useState<CartLine[]>([])
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState<'Card' | 'Cash' | 'EFT'>('Card')
  const [cashGiven, setCashGiven] = React.useState('')
  const [selectedClient, setSelectedClient] = React.useState('Walk-in')

  const tags = React.useMemo(() => {
    const set = new Set(PRODUCTS.map((p) => p.tag))
    return ['All', ...Array.from(set)]
  }, [])

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return PRODUCTS.filter((p) => {
      const tagOk = activeTag === 'All' ? true : p.tag === activeTag
      const qOk = q
        ? p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
        : true
      return tagOk && qOk
    })
  }, [query, activeTag])

  const subtotal = React.useMemo(
    () => cart.reduce((sum, l) => sum + l.product.price * l.qty, 0),
    [cart],
  )
  const tax = React.useMemo(() => subtotal * 0.15, [subtotal])
  const total = React.useMemo(() => subtotal + tax, [subtotal, tax])

  const cash = Number((cashGiven || '0').replace(/[^0-9.]/g, ''))
  const change = Math.max(0, cash - total)

  function addToCart(p: Product) {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.product.id === p.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return next
      }
      return [...prev, { product: p, qty: 1 }]
    })
  }

  function dec(id: string) {
    setCart((prev) => {
      const next = prev
        .map((l) => (l.product.id === id ? { ...l, qty: Math.max(0, l.qty - 1) } : l))
        .filter((l) => l.qty > 0)
      return next
    })
  }

  function inc(id: string) {
    setCart((prev) => prev.map((l) => (l.product.id === id ? { ...l, qty: l.qty + 1 } : l)))
  }

  function clear() {
    setCart([])
    setCashGiven('')
    setSelectedClient('Walk-in')
  }

  function openCharge() {
    setDrawerOpen(true)
  }

  function closeCharge() {
    setDrawerOpen(false)
  }

  function keypadPress(k: string) {
    if (k === '⌫') {
      setCashGiven((v) => v.slice(0, -1))
      return
    }
    if (k === 'CLR') {
      setCashGiven('')
      return
    }
    setCashGiven((v) => `${v}${k}`)
  }

  const canCharge = total > 0

  return (
    <div className="kx-card overflow-hidden">
      {/* Hero header */}
      <div
        className="relative p-6"
        style={{
          background:
            'radial-gradient(900px 420px at 18% -10%, rgb(var(--kx-accent) / 0.26), transparent 60%), radial-gradient(900px 420px at 86% -10%, rgb(var(--kx-accent-2) / 0.22), transparent 62%), linear-gradient(180deg, rgb(255 255 255 / 0.02), transparent 48%)',
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="kx-muted text-sm">Point of Sale</div>
            <div className="mt-1 text-[44px] font-semibold leading-none tracking-tight">
              {currencyZAR(total)}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="kx-chip">Client: {selectedClient}</span>
              <span className="kx-chip">Tax 15%</span>
              <span className="kx-chip">Today</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="kx-btn" onClick={clear} disabled={cart.length === 0}>
              Clear
            </button>
            <button className="kx-btn" onClick={() => setSelectedClient(selectedClient === 'Walk-in' ? 'Account Client' : 'Walk-in')}>
              {selectedClient === 'Walk-in' ? 'Select client' : 'Walk-in'}
            </button>
            <button className="kx-btn" onClick={() => alert('Save draft: coming next')}
              disabled={!canCharge}
            >
              Save draft
            </button>
            <button className="kx-btn-primary" onClick={openCharge} disabled={!canCharge}>
              Charge
            </button>
          </div>
        </div>

        {/* Progress meter */}
        <div className="mt-5 grid gap-3 lg:grid-cols-[1.3fr_.7fr]">
          <div className="kx-panel p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="kx-muted">Balance</span>
              <span className="font-medium">{currencyZAR(total)}</span>
            </div>
            <div className="mt-3 h-3 rounded-full bg-[rgb(var(--kx-surface2)/0.65)]">
              <div
                className="h-3 rounded-full"
                style={{
                  width: `${Math.min(100, (subtotal / Math.max(1, subtotal + 250)) * 100)}%`,
                  background:
                    'linear-gradient(90deg, rgb(var(--kx-accent)/0.95), rgb(var(--kx-accent-2)/0.85))',
                  boxShadow: '0 12px 30px rgb(var(--kx-accent)/0.18)',
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="kx-chip">Subtotal {currencyZAR(subtotal)}</span>
              <span className="kx-chip">Tax {currencyZAR(tax)}</span>
              <span className="kx-chip">Lines {cart.reduce((n, l) => n + l.qty, 0)}</span>
            </div>
          </div>

          <div className="kx-panel p-4">
            <div className="text-sm font-medium">Quick actions</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="kx-btn" onClick={() => alert('Open discounts: coming next')}>
                Discount
              </button>
              <button className="kx-btn" onClick={() => alert('Hold sale: coming next')}>
                Hold
              </button>
              <button className="kx-btn" onClick={() => alert('Print: coming next')}>
                Print
              </button>
              <button className="kx-btn" onClick={() => alert('Return/refund: coming next')}>
                Return
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main split */}
      <div className="grid gap-4 p-5 lg:grid-cols-[1.25fr_.75fr]">
        {/* Left: catalog */}
        <div className="kx-panel p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">Product search</div>
              <div className="text-xs kx-muted">Type a name or SKU. Tap to add.</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="kx-input w-[280px] max-w-full"
                placeholder="Search products / SKU…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="kx-btn" onClick={() => alert('Barcode scan: coming next')}>
                Scan
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                className={`kx-chip transition ${t === activeTag ? 'opacity-100' : 'opacity-75 hover:opacity-100'}`}
                onClick={() => setActiveTag(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="kx-card p-3 text-left transition"
                style={{
                  background:
                    'linear-gradient(180deg, rgb(255 255 255 / 0.035), transparent 44%), rgb(var(--kx-surface) / 1)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{p.name}</div>
                    <div className="mt-0.5 text-xs kx-muted2">{p.sku}</div>
                  </div>
                  <span className="kx-chip shrink-0">{p.tag}</span>
                </div>
                <div className="mt-3 text-sm font-semibold">{currencyZAR(p.price)}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="kx-card col-span-full p-5">
                <div className="text-sm font-medium">No matches</div>
                <div className="text-sm kx-muted">Try a different keyword or clear filters.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: cart */}
        <div className="kx-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Cart</div>
              <div className="text-xs kx-muted">Adjust quantities, then charge.</div>
            </div>
            <button className="kx-btn" onClick={clear} disabled={cart.length === 0}>
              Clear
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {cart.length === 0 && (
              <div className="kx-card p-4">
                <div className="text-sm font-medium">Nothing in the cart</div>
                <div className="text-sm kx-muted">Add products from the left to start a sale.</div>
              </div>
            )}
            {cart.map((l) => (
              <div key={l.product.id} className="kx-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{l.product.name}</div>
                    <div className="mt-0.5 text-xs kx-muted2">{l.product.sku}</div>
                  </div>
                  <div className="text-sm font-semibold">{currencyZAR(l.product.price * l.qty)}</div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="kx-chip">{currencyZAR(l.product.price)}</span>
                  <div className="flex items-center gap-2">
                    <button className="kx-btn h-9 w-9 px-0" onClick={() => dec(l.product.id)}>
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-medium">{l.qty}</span>
                    <button className="kx-btn h-9 w-9 px-0" onClick={() => inc(l.product.id)}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 kx-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="kx-muted">Subtotal</span>
              <span className="font-medium">{currencyZAR(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="kx-muted">Tax (15%)</span>
              <span className="font-medium">{currencyZAR(tax)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm kx-muted">Total</span>
              <span className="text-2xl font-semibold">{currencyZAR(total)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="kx-btn flex-1" onClick={() => alert('Convert to invoice: coming next')} disabled={!canCharge}>
                Invoice
              </button>
              <button className="kx-btn-primary flex-1" onClick={openCharge} disabled={!canCharge}>
                Charge
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            aria-label="Close"
            className="absolute inset-0"
            onClick={closeCharge}
            style={{ background: 'rgba(0,0,0,0.55)' }}
          />

          <div
            className="absolute left-1/2 top-1/2 w-[min(980px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2"
          >
            <div className="kx-card overflow-hidden">
              <div
                className="p-5"
                style={{
                  background:
                    'radial-gradient(900px 420px at 18% -10%, rgb(var(--kx-accent) / 0.20), transparent 62%), radial-gradient(900px 420px at 86% -10%, rgb(var(--kx-accent-2) / 0.16), transparent 62%), rgb(var(--kx-surface) / 1)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm kx-muted">Checkout</div>
                    <div className="mt-1 text-3xl font-semibold tracking-tight">{currencyZAR(total)}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(['Card', 'Cash', 'EFT'] as const).map((m) => (
                        <button
                          key={m}
                          className={`kx-chip transition ${m === paymentMethod ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                          onClick={() => setPaymentMethod(m)}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button className="kx-btn" onClick={closeCharge}>
                    Close
                  </button>
                </div>
              </div>

              <div className="grid gap-4 p-5 lg:grid-cols-[1fr_.9fr]">
                <div className="kx-panel p-4">
                  <div className="text-sm font-medium">Payment details</div>
                  <div className="mt-3 grid gap-2">
                    <div className="kx-card p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="kx-muted">Client</span>
                        <span className="font-medium">{selectedClient}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="kx-muted">Method</span>
                        <span className="font-medium">{paymentMethod}</span>
                      </div>
                    </div>

                    {paymentMethod === 'Cash' && (
                      <div className="kx-card p-3">
                        <div className="text-sm font-medium">Cash received</div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr]">
                          <input
                            className="kx-input"
                            value={cashGiven}
                            onChange={(e) => setCashGiven(e.target.value)}
                            placeholder="e.g. 500"
                          />
                          <div className="kx-card p-3">
                            <div className="text-xs kx-muted">Change</div>
                            <div className="mt-1 text-lg font-semibold">{currencyZAR(change)}</div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫', 'CLR', '00', '000', '500'].map(
                            (k) => (
                              <button
                                key={k}
                                className="kx-btn h-10"
                                onClick={() => keypadPress(k)}
                              >
                                {k}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {paymentMethod !== 'Cash' && (
                      <div className="kx-card p-3">
                        <div className="text-sm font-medium">Notes</div>
                        <div className="mt-2 text-sm kx-muted">
                          In production, Card uses the terminal / tap-to-pay, and EFT logs as manual payment.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="kx-panel p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Receipt preview</div>
                      <div className="text-xs kx-muted">What will be saved/printed.</div>
                    </div>
                    <span className="kx-chip">Draft</span>
                  </div>
                  <div className="mt-3 kx-card p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="kx-muted">Subtotal</span>
                      <span className="font-medium">{currencyZAR(subtotal)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="kx-muted">Tax</span>
                      <span className="font-medium">{currencyZAR(tax)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="kx-muted text-sm">Total</span>
                      <span className="text-2xl font-semibold">{currencyZAR(total)}</span>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <button
                        className="kx-btn-primary"
                        onClick={() => {
                          alert('Charge complete: next step = save payment + create invoice + auto PDF')
                          closeCharge()
                        }}
                      >
                        Confirm {paymentMethod}
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="kx-btn" onClick={() => alert('Print receipt: coming next')}>
                          Print
                        </button>
                        <button className="kx-btn" onClick={() => alert('Email receipt: coming next')}>
                          Email
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 kx-card p-4">
                    <div className="text-sm font-medium">Activity</div>
                    <div className="mt-2 space-y-2 text-sm">
                      {[{ t: 'Added items to cart', s: 'Just now' }, { t: 'Client set to Walk-in', s: '1m ago' }, { t: 'POS session started', s: 'Today' }].map(
                        (a, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="kx-muted">{a.t}</span>
                            <span className="kx-muted3">{a.s}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
