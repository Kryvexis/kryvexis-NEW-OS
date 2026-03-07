'use client'

import { useMemo, useState } from 'react'
import { EmailDocModal } from './email-doc-modal'

export function EmailDocButton(props: {
  label?: string
  defaultTo?: string | null
  kindLabel: 'Invoice' | 'Quote'
  number: string
  pdfUrl?: string | null
  companyId?: string | null
  entityType?: string | null
  entityId?: string | null
}) {
  const { label, defaultTo, kindLabel, number, pdfUrl, companyId, entityType, entityId } = props
  const [open, setOpen] = useState(false)

  const subject = useMemo(() => `${kindLabel} ${number} — Kryvexis`, [kindLabel, number])
  const msg = useMemo(
    () => `Hi,\n\nPlease find your ${kindLabel.toLowerCase()} ${number} attached.\n\nKind regards,\nKryvexis`,
    [kindLabel, number]
  )

  return (
    <>
      <button className="kx-button" onClick={() => setOpen(true)}>
        {label || 'Email'}
      </button>
      <EmailDocModal
        open={open}
        onClose={() => setOpen(false)}
        defaultTo={defaultTo || ''}
        defaultSubject={subject}
        defaultMessage={msg}
        attachmentUrl={pdfUrl || null}
        attachmentName={`${kindLabel}-${number}.pdf`}
        companyId={companyId || null}
        entityType={entityType || kindLabel.toLowerCase()}
        entityId={entityId || null}
      />
    </>
  )
}
