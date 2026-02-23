'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { createClient } from '@/lib/supabase/client'
import { fmtZar } from '@/lib/format'

type LineItem = { description: string; qty: number; unit_price: number; line_total: number }
type DocKind = 'invoice' | 'quote'

export function SaveDocButton(props: {
  kind: DocKind
  docId: string
  number: string
  companyName: string
  companyEmail?: string | null
  companyPhone?: string | null
  clientName?: string | null
  issueDate?: string | null
  dueOrExpiryDate?: string | null
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
  status?: string | null
  existingPath?: string | null
  items: LineItem[]
  autoIfMissing?: boolean
}) {
  const {
    kind, docId, number, companyName, companyEmail, companyPhone, clientName, issueDate, dueOrExpiryDate,
    subtotal, taxTotal, discountTotal, total, items, existingPath, autoIfMissing
  } = props

  const [busy, setBusy] = useState(false)
  const [path, setPath] = useState<string | null>(existingPath ?? null)
  const [err, setErr] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  const bucket = 'kx-docs'
  const objectPath = useMemo(() => `${kind}s/${docId}.pdf`, [kind, docId])

  const makePdf = useCallback(async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const marginX = 48
    let y = 56

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.text(companyName || 'Kryvexis', marginX, y)
    y += 16
    doc.setFontSize(10)
    if (companyEmail) { doc.text(String(companyEmail), marginX, y); y += 12 }
    if (companyPhone) { doc.text(String(companyPhone), marginX, y); y += 12 }

    // Header right
    doc.setFontSize(18)
    doc.text(kind === 'invoice' ? 'INVOICE' : 'QUOTE', 560, 56, { align: 'right' })
    doc.setFontSize(12)
    doc.text(number || '', 560, 76, { align: 'right' })
    doc.setFontSize(10)
    if (issueDate) doc.text(`Issue: ${issueDate}`, 560, 94, { align: 'right' })
    if (dueOrExpiryDate) doc.text(`${kind === 'invoice' ? 'Due' : 'Expiry'}: ${dueOrExpiryDate}`, 560, 108, { align: 'right' })

    y = Math.max(y + 10, 140)

    doc.setFontSize(10)
    doc.setTextColor(60)
    doc.text(kind === 'invoice' ? 'Bill To' : 'Quote For', marginX, y)
    y += 14
    doc.setTextColor(0)
    doc.setFontSize(12)
    doc.text(clientName || '—', marginX, y)
    y += 18

    // Items table
    const body = (items || []).map((it) => [
      it.description || '',
      String(Number(it.qty || 0)),
      fmtZar(Number(it.unit_price || 0)),
      fmtZar(Number(it.line_total || 0)),
    ])

    autoTable(doc, {
      startY: y + 6,
      head: [['Description', 'Qty', 'Unit', 'Line']],
      body,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [245, 245, 245], textColor: 20 },
      columnStyles: {
        1: { halign: 'right', cellWidth: 50 },
        2: { halign: 'right', cellWidth: 90 },
        3: { halign: 'right', cellWidth: 90 },
      },
    })

    const finalY = (doc as any).lastAutoTable?.finalY ?? (y + 120)
    let y2 = finalY + 16

    // Totals box
    const boxX = 360
    doc.setDrawColor(220)
    doc.roundedRect(boxX, y2, 200, 92, 10, 10)

    const row = (label: string, value: string, yy: number) => {
      doc.setFontSize(10)
      doc.setTextColor(80)
      doc.text(label, boxX + 12, yy)
      doc.setTextColor(0)
      doc.text(value, boxX + 188, yy, { align: 'right' })
    }

    row('Subtotal', fmtZar(subtotal || 0), y2 + 22)
    row('Discount', fmtZar(discountTotal || 0), y2 + 40)
    row('Tax', fmtZar(taxTotal || 0), y2 + 58)
    doc.setFontSize(11)
    doc.setTextColor(0)
    doc.text('Total', boxX + 12, y2 + 78)
    doc.setFontSize(12)
    doc.text(fmtZar(total || 0), boxX + 188, y2 + 78, { align: 'right' })

    return doc.output('blob') as Blob
  }, [companyName, companyEmail, companyPhone, kind, number, issueDate, dueOrExpiryDate, clientName, items, subtotal, discountTotal, taxTotal, total])

  const uploadAndSave = useCallback(async () => {
    setErr(null)
    setBusy(true)
    try {
      const blob = await makePdf()

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(objectPath, blob, { contentType: 'application/pdf', upsert: true })

      if (upErr) throw upErr

      // Store the path on the document for quick download links
      if (kind === 'invoice') {
        const { error: uerr } = await supabase.from('invoices').update({ pdf_path: objectPath, pdf_generated_at: new Date().toISOString() }).eq('id', docId)
        if (uerr) throw uerr
      } else {
        const { error: uerr } = await supabase.from('quotes').update({ pdf_path: objectPath, pdf_generated_at: new Date().toISOString() }).eq('id', docId)
        if (uerr) throw uerr
      }

      setPath(objectPath)
    } catch (e: any) {
      setErr(e?.message || 'Failed to save PDF')
    } finally {
      setBusy(false)
    }
  }, [bucket, docId, kind, makePdf, objectPath, supabase])

  const downloadUrl = useMemo(() => {
    if (!path) return null
    // public bucket: we can use getPublicUrl
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl || null
  }, [bucket, path, supabase])

  useEffect(() => {
    if (autoIfMissing && !path && !busy) {
      // small delay to avoid blocking first paint
      const t = setTimeout(() => { uploadAndSave() }, 350)
      return () => clearTimeout(t)
    }
  }, [autoIfMissing, busy, path, uploadAndSave])

  return (
    <div className="flex items-center gap-2">
      {downloadUrl && (
        <a className="kx-button" href={downloadUrl} target="_blank" rel="noreferrer">
          Download PDF
        </a>
      )}
      <button className="kx-button" onClick={uploadAndSave} disabled={busy}>
        {busy ? 'Saving…' : (downloadUrl ? 'Re-generate PDF' : 'Generate & Save PDF')}
      </button>
      {err && <span className="text-xs text-red-300">{err}</span>}
    </div>
  )
}
