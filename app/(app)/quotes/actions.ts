'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireCompanyId } from '@/lib/kx'
import { genDocNumber } from '@/lib/format'

const ItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1),
  qty: z.number().positive(),
  unit_price: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  tax_rate: z.number().nonnegative().default(0), // 0.15 for 15%
})

const QuoteSchema = z.object({
  client_id: z.string().uuid(),
  issue_date: z.string().min(10),
  expiry_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(ItemSchema).min(1),
})

function calcTotals(items: z.infer<typeof ItemSchema>[]) {
  let subtotal = 0
  let discount_total = 0
  let tax_total = 0
  for (const it of items) {
    const lineBase = it.qty * it.unit_price
    const lineDiscount = Math.min(it.discount, lineBase)
    const lineAfter = Math.max(0, lineBase - lineDiscount)
    const lineTax = lineAfter * (it.tax_rate || 0)
    subtotal += lineBase
    discount_total += lineDiscount
    tax_total += lineTax
  }
  const total = Math.max(0, subtotal - discount_total) + tax_total
  return { subtotal, discount_total, tax_total, total }
}

export async function createQuoteAction(payload: unknown) {
  const parsed = QuoteSchema.safeParse(payload)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { subtotal, discount_total, tax_total, total } = calcTotals(parsed.data.items)
  const number = genDocNumber('Q')

  const { data: quote, error: qErr } = await supabase
    .from('quotes')
    .insert({
      company_id: companyId,
      client_id: parsed.data.client_id,
      number,
      status: 'Draft',
      issue_date: parsed.data.issue_date,
      expiry_date: parsed.data.expiry_date || null,
      subtotal,
      discount_total,
      tax_total,
      total,
      notes: parsed.data.notes || null,
      terms: parsed.data.terms || null,
    })
    .select('id')
    .single()

  if (qErr) return { ok: false, error: qErr.message }

  const itemsRows = parsed.data.items.map((it) => {
    const lineBase = it.qty * it.unit_price
    const lineDiscount = Math.min(it.discount, lineBase)
    const lineAfter = Math.max(0, lineBase - lineDiscount)
    const lineTax = lineAfter * (it.tax_rate || 0)
    const lineTotal = lineAfter + lineTax

    return {
      quote_id: quote.id,
      product_id: it.product_id || null,
      description: it.description,
      qty: it.qty,
      unit_price: it.unit_price,
      discount: it.discount,
      tax_rate_id: null,
      line_total: lineTotal,
    }
  })

  const { error: iErr } = await supabase.from('quote_items').insert(itemsRows)
  if (iErr) return { ok: false, error: iErr.message }

  // best-effort activity log
  try {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (userId) {
      await supabase.from('activity_logs').insert({
        company_id: companyId,
        user_id: userId,
        entity_type: 'quote',
        entity_id: quote.id,
        action: 'created',
      })
    }
  } catch {}

  revalidatePath('/quotes')
  return { ok: true, id: quote.id }
}

export async function convertQuoteToInvoiceAction(quoteId: string) {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const [{ data: quote, error: qErr }, { data: items, error: itErr }] = await Promise.all([
    supabase.from('quotes').select('*').eq('id', quoteId).maybeSingle(),
    supabase.from('quote_items').select('*').eq('quote_id', quoteId),
  ])

  if (qErr) return { ok: false, error: qErr.message }
  if (itErr) return { ok: false, error: itErr.message }
  if (!quote) return { ok: false, error: 'Quote not found' }

  const number = genDocNumber('INV')

  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      company_id: companyId,
      client_id: quote.client_id,
      number,
      status: 'Draft',
      issue_date: quote.issue_date,
      due_date: null,
      subtotal: quote.subtotal,
      discount_total: quote.discount_total,
      tax_total: quote.tax_total,
      total: quote.total,
      balance_due: quote.total,
      notes: quote.notes,
      terms: quote.terms,
    })
    .select('id')
    .single()

  if (invErr) return { ok: false, error: invErr.message }

  if (items?.length) {
    const rows = items.map((it) => ({
      invoice_id: invoice.id,
      product_id: it.product_id,
      description: it.description,
      qty: it.qty,
      unit_price: it.unit_price,
      discount: it.discount,
      tax_rate_id: it.tax_rate_id,
      line_total: it.line_total,
    }))
    const { error: insErr } = await supabase.from('invoice_items').insert(rows)
    if (insErr) return { ok: false, error: insErr.message }
  }

  await supabase.from('quotes').update({ status: 'Accepted' }).eq('id', quoteId)

  // best-effort activity log
  try {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (userId) {
      await supabase.from('activity_logs').insert({
        company_id: companyId,
        user_id: userId,
        entity_type: 'invoice',
        entity_id: invoice.id,
        action: 'created_from_quote',
      })
    }
  } catch {}

  revalidatePath('/quotes')
  revalidatePath('/invoices')
  return { ok: true, invoiceId: invoice.id }
}


export async function updateQuoteStatusAction(quoteId: string, nextStatus: string) {
  const supabase = await createClient()
  const companyId = await requireCompanyId()
  const { data: q, error: qErr } = await supabase.from('quotes').select('id,status').eq('id', quoteId).maybeSingle()
  if (qErr) return { ok: false, error: qErr.message }
  if (!q) return { ok: false, error: 'Quote not found' }

  const prev = String(q.status || 'Draft')
  const { error } = await supabase.from('quotes').update({ status: nextStatus }).eq('id', quoteId)
  if (error) return { ok: false, error: error.message }

  // best-effort activity log
  try {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (userId) {
      await supabase.from('activity_logs').insert({
        company_id: companyId,
        user_id: userId,
        entity_type: 'quote',
        entity_id: quoteId,
        action: `status:${prev}→${nextStatus}`,
      })
    }
  } catch {}

  revalidatePath(`/quotes/${quoteId}`)
  revalidatePath('/sales/quotes')
  return { ok: true }
}

export async function logQuoteWhatsAppSentAction(input: { quote_id: string; phone?: string | null; message?: string | null }) {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  // update quote to Sent if currently Draft
  try {
    const { data: q } = await supabase.from('quotes').select('status').eq('id', input.quote_id).maybeSingle()
    const status = String(q?.status || 'Draft')
    if (status === 'Draft') {
      await supabase.from('quotes').update({ status: 'Sent' }).eq('id', input.quote_id)
    }
  } catch {}

  try {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (userId) {
      await supabase.from('activity_logs').insert({
        company_id: companyId,
        user_id: userId,
        entity_type: 'quote',
        entity_id: input.quote_id,
        action: 'sent_whatsapp',
      })
    }
  } catch {}

  revalidatePath(`/quotes/${input.quote_id}`)
  revalidatePath('/sales/quotes')
  return { ok: true }
}
