'use client'

import * as React from 'react'
import { Modal } from '@/components/ui/Modal'

export type CompanyOption = { id: string; name: string | null }

export default function CompanySwitcher({
  currentCompanyId,
  companies,
  onClose,
  open,
}: {
  currentCompanyId?: string
  companies: CompanyOption[]
  open: boolean
  onClose: () => void
}) {
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  async function setActive(companyId: string) {
    setBusyId(companyId)
    setError(null)
    try {
      const res = await fetch('/api/company/active', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ companyId }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(j?.error || 'Failed to switch company')
      // Refresh current page to reload server components with new cookie
      window.location.reload()
    } catch (e: any) {
      setError(e?.message || 'Failed to switch company')
      setBusyId(null)
    }
  }

  return (
    <Modal open={open} title="Switch company" onClose={onClose}>
      <div className="grid gap-2">
        {companies.map((c) => {
          const active = c.id === currentCompanyId
          const busy = busyId === c.id
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              disabled={busy}
              className={
                'w-full rounded-2xl border px-3 py-3 text-left text-sm transition ' +
                (active
                  ? 'border-white/15 bg-[rgba(var(--kx-border),.10)] text-[rgba(var(--kx-fg),.92)]'
                  : 'border-[rgba(var(--kx-fg),.12)] bg-[rgba(var(--kx-fg),.05)] text-[rgba(var(--kx-fg),.92)]/80 hover:bg-[rgba(var(--kx-fg),.10)] hover:text-[rgba(var(--kx-fg),.92)]')
              }
            >
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium tracking-tight truncate">{c.name || 'Workspace'}</div>
                  <div className="text-[11px] kx-muted truncate">{c.id}</div>
                </div>
                {active ? <span className="kx-chip">Active</span> : null}
                {busy ? <span className="kx-chip">Switching…</span> : null}
              </div>
            </button>
          )
        })}
      </div>
      {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
    </Modal>
  )
}
