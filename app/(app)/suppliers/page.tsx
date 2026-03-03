import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { Card } from '@/components/card'
import { createSupplierAction } from './actions'
import SupplierList from './SupplierList'
import { Page } from '@/components/ui/page'

export default async function Page() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id,name,email,phone,created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(500)

  return (
    <Page title="Suppliers" subtitle="Manage suppliers and catalog sources.">

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
          <button className="kx-btn kx-btn-primary">Add supplier</button>
          <textarea name="notes" placeholder="Notes" className="kx-input md:col-span-4 min-h-[84px]" />
        </form>
      </Card>

      <SupplierList suppliers={(suppliers as any) || []} />
    </Page>
  )
}
