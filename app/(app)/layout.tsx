import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Shell from '@/components/shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) redirect('/login')

  return <Shell userEmail={data.user.email ?? 'user'}><div className="kx-page">{children}</div></Shell>
}
