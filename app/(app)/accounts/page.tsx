import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { Card } from '@/components/card'
import { createTransactionAction } from './actions'

import Link from 'next/link'
import { fmtZar } from '@/lib/format'

export default async function Page() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: txs } = await supabase
    .from('transactions')
    .select('id,kind,amount,category,memo,tx_date,created_at')
    .eq('company_id', companyId)
    .order('tx_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(200)

  const income = (txs || []).filter((t) => t.kind === 'income').reduce((a, t) => a + Number(t.amount), 0)
  const expense = (txs || []).filter((t) => t.kind === 'expense').reduce((a, t) => a + Number(t.amount), 0)
  const byMonth = new Map<string, { income: number; expense: number }>()
  for (const t of txs || []) {
    const k = String(t.tx_date || t.created_at || '').slice(0,7)
    if (!k) continue
    const cur = byMonth.get(k) || { income: 0, expense: 0 }
    if (t.kind === 'income') cur.income += Number(t.amount || 0)
    else cur.expense += Number(t.amount || 0)
    byMonth.set(k, cur)
  }
  const months = Array.from(byMonth.keys()).sort().slice(-6)
  const series = months.map((k) => ({
    key: k,
    label: new Date(Number(k.slice(0,4)), Number(k.slice(5,7))-1, 1).toLocaleString('en-ZA', { month: 'short' }),
    income: byMonth.get(k)?.income || 0,
    expense: byMonth.get(k)?.expense || 0,
  }))
  const maxV = Math.max(1, ...series.map((s) => Math.max(s.income, s.expense)))

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xl font-semibold">Accounts</div>
        <div className="text-sm kx-muted">Track income & expenses. Simple cash flow view.</div>
      </div>
        <div className="flex items-center gap-2">
          <Link href="/api/transactions/export" className="kx-button">Export CSV</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <div className="text-xs kx-muted2">Income</div>
          <div className="text-xl font-semibold mt-1">{fmtZar(income)}</div>
        </Card>
        <Card>
          <div className="text-xs kx-muted2">Expenses</div>
          <div className="text-xl font-semibold mt-1">{fmtZar(expense)}</div>
        </Card>
        <Card>
          <div className="text-xs kx-muted2">Net</div>
          <div className="text-xl font-semibold mt-1">{fmtZar(income - expense)}</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Cash flow</div>
            <div className="text-xs kx-muted2">Income vs expenses (last {series.length} months)</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-6 gap-3 h-44">
          {series.map((s) => (
            <div key={s.key} className="flex flex-col items-center justify-end gap-2">
              <div className="w-full flex items-end gap-2">
                <div className="flex-1 rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] overflow-hidden">
                  <div className="kx-bar" style={{ height: `${Math.max(6, Math.round((s.income / maxV) * 140))}px` }} />
                </div>
                <div className="flex-1 rounded-xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] overflow-hidden">
                  <div className="kx-bar" style={{ height: `${Math.max(6, Math.round((s.expense / maxV) * 140))}px` }} />
                </div>
              </div>
              <div className="text-[11px] kx-muted2">{s.label}</div>
            </div>
          ))}
          {!series.length && <div className="col-span-6 text-sm kx-muted2">No transactions yet.</div>}
        </div>
        <div className="mt-2 text-xs kx-muted2">Left bar = income · Right bar = expense</div>
      </Card>


      <Card>
        <form
  action={async (formData: FormData) => {
    'use server';
    await createTransactionAction(formData);
  }}
  className="grid grid-cols-1 md:grid-cols-6 gap-3"
>
          <select name="kind" className="kx-input" defaultValue="income">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input name="amount" className="kx-input" placeholder="Amount" inputMode="decimal" required />
          <input name="category" className="kx-input" placeholder="Category" />
          <input name="tx_date" className="kx-input" type="date" />
          <input name="memo" className="kx-input md:col-span-2" placeholder="Memo" />
          <button className="kx-btn-primary md:col-span-6">Add transaction</button>
        </form>
      </Card>

      <Card>
        <div className="text-sm kx-muted mb-3">Recent transactions</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[rgba(var(--kx-fg),.92)]/50">
              <tr className="border-b border-[rgba(var(--kx-border),.12)]">
                <th className="py-2 text-left font-medium">Date</th>
                <th className="py-2 text-left font-medium">Type</th>
                <th className="py-2 text-left font-medium">Category</th>
                <th className="py-2 text-left font-medium">Memo</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(txs || []).map((t) => (
                <tr key={t.id} className="kx-row">
                  <td className="py-2 kx-muted">{t.tx_date || new Date(t.created_at).toISOString().slice(0, 10)}</td>
                  <td className="py-2">{t.kind === 'income' ? 'Income' : 'Expense'}</td>
                  <td className="py-2 kx-muted">{t.category || '—'}</td>
                  <td className="py-2 kx-muted">{t.memo || '—'}</td>
                  <td className="py-2 text-right font-medium">{fmtZar(Number(t.amount))}</td>
                </tr>
              ))}
              {!txs?.length && (
                <tr>
                  <td className="py-6 text-[rgba(var(--kx-fg),.92)]/50" colSpan={5}>
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
