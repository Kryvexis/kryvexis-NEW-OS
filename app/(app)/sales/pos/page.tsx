import ModuleTabs from '@/components/module-tabs'
import { salesTabs } from '../tabs'

export default function SalesPOS() {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={salesTabs} />

      <div className="kx-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">POS</div>
            <div className="text-sm kx-muted">Fast invoice creation for counter sales and quick payments.</div>
          </div>
          <span className="kx-chip">Coming next</span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="kx-panel p-4">
            <div className="text-sm font-medium">Quick search</div>
            <div className="mt-3 flex gap-2">
              <input className="kx-input" placeholder="Search products / SKU…" />
              <button className="kx-btn">Scan</button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="kx-card p-3">
                  <div className="text-sm font-medium">Item {i + 1}</div>
                  <div className="text-xs kx-muted">Tap to add</div>
                </div>
              ))}
            </div>
          </div>

          <div className="kx-panel p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Cart</div>
              <button className="kx-btn">Clear</button>
            </div>
            <div className="mt-3 kx-card p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="kx-muted">Subtotal</span>
                <span className="font-medium">R 0.00</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="kx-muted">Tax</span>
                <span className="font-medium">R 0.00</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm kx-muted">Total</span>
                <span className="text-xl font-semibold">R 0.00</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="kx-btn flex-1">Save</button>
                <button className="kx-btn-primary flex-1">Charge</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map((k) => (
                <button key={k} className="kx-btn h-11">{k}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
