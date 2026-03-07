import { createClient } from '@supabase/supabase-js'

export function serviceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service env vars')
  return createClient(url, key)
}

export async function logEmailEvent(input: {
  companyId?: string | null
  eventType: string
  recipient?: string | null
  entityType?: string | null
  entityId?: string | null
  meta?: Record<string, any>
}) {
  try {
    const supabase = serviceSupabase()
    await supabase.from('email_events').insert({
      company_id: input.companyId || null,
      event_type: input.eventType,
      recipient: input.recipient || null,
      entity_type: input.entityType || null,
      entity_id: input.entityId || null,
      meta: input.meta || {},
    })
  } catch {
    // keep email flow non-blocking if log table is not present yet
  }
}
