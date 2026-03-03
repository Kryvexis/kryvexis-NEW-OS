import { redirect } from 'next/navigation'
import { getCurrentUserRole } from '@/lib/roles'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function SalesRoot() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = await getCurrentUserRole()

  // Cashiers + Staff should start in POS.
  if (role === 'cashier' || role === 'staff') {
    redirect('/sales/pos')
  }

  redirect('/sales/overview')
}
