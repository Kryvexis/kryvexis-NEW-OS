import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { Card } from '@/components/card'
import { createSupplierAction } from './actions'

export default async function Page() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id,name,email,phone,created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Suppliers</div>
        <div className="text-sm text-white/60">Manage suppliers and catalog sources.</div>
      </div>

      <Card>
        <form
  action={async (formData: FormData) => {
    'use server';
    await createSupplierAction(formData);
  }}
  className="grid grid-cols-1 md:grid-cols-4 gap-3"
>
          <input name="name" placeholder="Supplier name" className="kx-input" required />
          <input name="email" placeholder="Email" className="kx-input" />
          <input name="phone" placeholder="Phone" className="kx-input" />
          <button className="kx-btn-primary">Add supplier</button>
          <textarea name="notes" placeholder="Notes" className="kx-input md:col-span-4 min-h-[84px]" />
        </form>
      </Card>

      <Card>
        <div className="text-sm text-white/60 mb-3">Suppliers</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/50">
              <tr className="border-b border-white/10">
                <th className="py-2 text-left font-medium">Name</th>
                <th className="py-2 text-left font-medium">Email</th>
                <th className="py-2 text-left font-medium">Phone</th>
              </tr>
            </thead>
            <tbody>
              {(suppliers || []).map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2">{s.name}</td>
                  <td className="py-2 text-white/70">{s.email || '—'}</td>
                  <td className="py-2 text-white/70">{s.phone || '—'}</td>
                </tr>
              ))}
              {!suppliers?.length && (
                <tr>
                  <td className="py-6 text-white/50" colSpan={3}>
                    No suppliers yet.
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
