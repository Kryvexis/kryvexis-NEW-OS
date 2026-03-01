'use client'

import * as React from 'react'
import { useFormState, useFormStatus } from 'react-dom'

type Company = {
  name?: string | null
  phone?: string | null
  address?: string | null
  id?: string | null
  email?: string | null
}

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button className="kx-button kx-button-primary" type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save workspace details'}
    </button>
  )
}

export function WorkspaceForm({
  company,
  action,
}: {
  company: Company | null
  action: (prevState: any, formData: FormData) => Promise<any>
}) {
  const [state, formAction] = useFormState(action as any, { ok: false, ts: 0, message: '' })

  // auto-hide toast
  const [show, setShow] = React.useState(false)
  React.useEffect(() => {
    if (state?.ok) {
      setShow(true)
      const t = setTimeout(() => setShow(false), 2500)
      return () => clearTimeout(t)
    }
  }, [state?.ts, state?.ok])

  return (
    <div className="relative">
      {show ? (
        <div className="pointer-events-none absolute -top-2 right-0 z-10">
          <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/85 shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop-blur-md">
            Saved ✓
          </div>
        </div>
      ) : null}

      <form action={formAction} className="mt-4 grid grid-cols-1 gap-3">
        <label className="block">
          <div className="text-xs kx-muted mb-1">Company name</div>
          <input className="kx-input" name="name" defaultValue={company?.name || ''} placeholder="Your business name" />
        </label>

        <label className="block">
          <div className="text-xs kx-muted mb-1">WhatsApp / Cellphone</div>
          <input className="kx-input" name="phone" defaultValue={company?.phone || ''} placeholder="+27…" inputMode="tel" />
          <div className="mt-1 text-[11px] kx-muted">Tip: use country code. Example: +27 68 628 2874.</div>
        </label>

        <label className="block">
          <div className="text-xs kx-muted mb-1">Address</div>
          <input className="kx-input" name="address" defaultValue={company?.address || ''} placeholder="Business address (optional)" />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pt-1">
          <div className="kx-muted">Workspace ID</div>
          <div className="text-xs kx-muted break-all">{company?.id || '—'}</div>
          <div className="kx-muted">Workspace email</div>
          <div>{company?.email || '—'}</div>
        </div>

        <div className="pt-2">
          <SaveButton />
        </div>
      </form>
    </div>
  )
}
