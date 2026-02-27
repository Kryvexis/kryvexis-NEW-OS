import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import Shell from '@/components/shell'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Kryvexis OS',
  description: 'Inventory & sales operating system',
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return <Shell userEmail={user.email ?? 'user'}>{children}</Shell>
}
