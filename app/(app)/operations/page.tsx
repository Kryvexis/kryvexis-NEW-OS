import Link from 'next/link'

function Tile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-[rgba(var(--kx-surface),.80)] p-5 transition hover:bg-[rgba(var(--kx-surface),.95)]"
      style={{ borderColor: 'rgb(var(--kx-border) / 0.12)', boxShadow: 'var(--kx-shadow-card)' }}
    >
      <div className="text-base font-semibold tracking-tight text-kx-fg">{title}</div>
      <div className="mt-1 text-sm kx-muted">{desc}</div>
      <div className="mt-4 text-xs font-semibold text-kx-fg/70 group-hover:text-kx-fg/90">Open →</div>
    </Link>
  )
}

export default function OperationsRoot() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-kx-fg">Operations</h1>
        <p className="mt-1 text-sm kx-muted">Products, stock, suppliers, and procurement.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Tile href="/operations/products" title="Products" desc="Manage product catalog, pricing, and barcodes." />
        <Tile href="/operations/stock" title="Stock" desc="Adjust stock, view movements, and stock value." />
        <Tile href="/operations/suppliers" title="Suppliers" desc="Suppliers, statements, and supplier details." />
        <Tile href="/buyers" title="Buyers" desc="Low stock + reorder suggestions (procurement)." />
      </div>
    </div>
  )
}
