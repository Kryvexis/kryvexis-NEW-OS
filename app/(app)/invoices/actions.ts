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
  tax_rate: z.number().nonnegative().default(0),
})

const InvoiceSchema = z.object({
  client_id: z.string().uuid(),
  issue_date: z.string().min(10),
  due_date: z.string().optional().nullable(),
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

export async function createInvoiceAction(payload: unknown) {
  const parsed = InvoiceSchema.safeParse(payload)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { subtotal, discount_total, tax_total, total } = calcTotals(parsed.data.items)
  const number = genDocNumber('INV')

  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .insert({
      company_id: companyId,
      client_id: parsed.data.client_id,
      number,
      status: 'Draft',
      issue_date: parsed.data.issue_date,
      due_date: parsed.data.due_date || null,
      subtotal,
      discount_total,
      tax_total,
      total,
      balance_due: total,
      notes: parsed.data.notes || null,
      terms: parsed.data.terms || null,
    })
    .select('id')
    .single()

  if (invErr) return { ok: false, error: invErr.message }

  const rows = parsed.data.items.map((it) => {
    const lineBase = it.qty * it.unit_price
    const lineDiscount = Math.min(it.discount, lineBase)
    const lineAfter = Math.max(0, lineBase - lineDiscount)
    const lineTax = lineAfter * (it.tax_rate || 0)
    const lineTotal = lineAfter + lineTax
    return {
      invoice_id: invoice.id,
      product_id: it.product_id || null,
      description: it.description,
      qty: it.qty,
      unit_price: it.unit_price,
      discount: it.discount,
      tax_rate_id: null,
      line_total: lineTotal,
    }
  })

  const { error: itemsErr } = await supabase.from('invoice_items').insert(rows)
  if (itemsErr) return { ok: false, error: itemsErr.message }

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
        action: 'created',
      })
    }
  } catch {}

  revalidatePath('/invoices')
  return { ok: true, id: invoice.id }
}

const PaymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount: z.number().positive(),
  payment_date: z.string().min(10),
  method: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
})

export async function recordPaymentAction(payload: unknown) {
  const parsed = PaymentSchema.safeParse(payload)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid data' }

  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .select('id,total,balance_due,status')
    .eq('id', parsed.data.invoice_id)
    .maybeSingle()

  if (invErr) return { ok: false, error: invErr.message }
  if (!invoice) return { ok: false, error: 'Invoice not found' }

  const { error: payErr } = await supabase.from('payments').insert({
    company_id: companyId,
    invoice_id: parsed.data.invoice_id,
    amount: parsed.data.amount,
    payment_date: parsed.data.payment_date,
    method: parsed.data.method || null,
    reference: parsed.data.reference || null,
  })

  if (payErr) return { ok: false, error: payErr.message }

  const newBalance = Math.max(0, Number(invoice.balance_due || 0) - parsed.data.amount)
  const newStatus = newBalance <= 0.00001 ? 'Paid' : 'Partially Paid'

  const { error: updErr } = await supabase
    .from('invoices')
    .update({ balance_due: newBalance, status: newStatus })
    .eq('id', parsed.data.invoice_id)

  if (updErr) return { ok: false, error: updErr.message }

  // best-effort activity log
  try {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (userId) {
      await supabase.from('activity_logs').insert({
        company_id: companyId,
        user_id: userId,
        entity_type: 'payment',
        entity_id: parsed.data.invoice_id,
        action: 'recorded',
      })
    }
  } catch {}

  revalidatePath('/invoices')
  revalidatePath(`/invoices/${parsed.data.invoice_id}`)
  revalidatePath('/payments')
  return { ok: true }
}


export async function updateInvoiceStatusAction(invoiceId: string, nextStatus: string) {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  const { data: inv, error: invErr } = await supabase.from('invoices').select('id,status').eq('id', invoiceId).maybeSingle()
  if (invErr) return { ok: false, error: invErr.message }
  if (!inv) return { ok: false, error: 'Invoice not found' }

  const prev = String(inv.status || 'Draft')
  const { error } = await supabase.from('invoices').update({ status: nextStatus }).eq('id', invoiceId)
  if (error) return { ok: false, error: error.message }

  try {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (userId) {
      await supabase.from('activity_logs').insert({
        company_id: companyId,
        user_id: userId,
        entity_type: 'invoice',
        entity_id: invoiceId,
        action: `status:${prev}→${nextStatus}`,
      })
    }
  } catch {}

  revalidatePath(`/invoices/${invoiceId}`)
  revalidatePath('/sales/invoices')
  return { ok: true }
}

export async function logInvoiceWhatsAppSentAction(input: { invoice_id: string; phone?: string | null; message?: string | null }) {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  // mark as Sent if Draft
  try {
    const { data: inv } = await supabase.from('invoices').select('status').eq('id', input.invoice_id).maybeSingle()
    const status = String(inv?.status || 'Draft')
    if (status === 'Draft') {
      await supabase.from('invoices').update({ status: 'Sent' }).eq('id', input.invoice_id)
    }
  } catch {}

  try {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (userId) {
      await supabase.from('activity_logs').insert({
        company_id: companyId,
        user_id: userId,
        entity_type: 'invoice',
        entity_id: input.invoice_id,
        action: 'sent_whatsapp',
      })
    }
  } catch {}

  revalidatePath(`/invoices/${input.invoice_id}`)
  revalidatePath('/sales/invoices')
  return { ok: true }
}

export async function logInvoiceViewedAction(input: { invoice_id: string }) {
  const supabase = await createClient()
  const companyId = await requireCompanyId()

  try {
    const { data: u } = await supabase.auth.getUser()
    const userId = u.user?.id
    if (userId) {
      await supabase.from('activity_logs').insert({
        company_id: companyId,
        user_id: userId,
        entity_type: 'invoice',
        entity_id: input.invoice_id,
        action: 'viewed',
      })
    }
  } catch {}

  revalidatePath(`/invoices/${input.invoice_id}`)
  revalidatePath('/sales/invoices')
  return { ok: true }
}
