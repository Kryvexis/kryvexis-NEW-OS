import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { Card } from '@/components/card'
import { PosHeroShell } from '@/components/pos/hero-shell'
import { EmptyState } from '@/components/pos/empty'
import SalesClientsClient from './clients-client'

export default async function SalesClients() {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: clients }, { data: activity }] = await Promise.all([
    supabase
      .from('clients')
      .select('id,name,email,phone,tags_json')
      .eq('company_id', companyId)
      .order('name', { ascending: true })
      .limit(600),
    supabase
      .from('activity_logs')
      .select('id,action,entity_type,entity_id,created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="space-y-4">      <PosHeroShell
        title="Clients"
        subtitle="Find, open or message a client in seconds."
        actions={
          <>
            <Link href="/quotes/new" className="kx-button">
              New Quote
            </Link>
            <Link href="/clients/new" className="kx-button">
              Add client
            </Link>
          </>
        }
        rail={
          <>
            <Card>
              <div className="text-sm font-semibold">Quick actions</div>
              <div className="mt-3 grid gap-2">
                <Link className="kx-button" href="/sales/pos">
                  Open POS
                </Link>
                <Link className="kx-button" href="/sales/quotes">
                  View quotes
                </Link>
                <Link className="kx-button" href="/sales/invoices">
                  View invoices
                </Link>
              </div>
            </Card>
            <Card>
              <div className="text-sm font-semibold">Recent activity</div>
              <div className="mt-3 space-y-2">
                {(activity || []).map((a: any) => (
                  <div key={a.id} className="rounded-2xl bg-[rgba(var(--kx-fg),.045)] px-3 py-2">
                    <div className="text-sm">{String(a.action || 'Updated')}</div>
                    <div className="text-xs kx-muted">
                      {String(a.entity_type || 'item')} · {new Date(String(a.created_at)).toLocaleString('en-ZA')}
                    </div>
                  </div>
                ))}
                {!activity?.length ? <div className="text-sm kx-muted">No activity yet.</div> : null}
              </div>
            </Card>
          </>
        }
      >
        {(clients || []).length ? (
          <Card>
            <SalesClientsClient clients={(clients as any) || []} />
          </Card>
        ) : (
          <Card>
            <EmptyState
              title="No clients yet"
              subtitle="Add a client to start creating quotes and invoices."
              action={
                <Link href="/clients/new" className="kx-button">
                  Add your first client
                </Link>
              }
            />
          </Card>
        )}
      </PosHeroShell>
    </div>
  )
}
