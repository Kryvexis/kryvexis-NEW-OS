'use client'

import { useState } from 'react'
import { createClientAction } from './actions'

export default function ClientsUI() {
  const [pending, setPending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  return (
    <form
      className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-4"
      action={async (fd) => {
        setPending(true)
        setMsg(null)
        const res = await createClientAction(fd)
        setPending(false)
        setMsg(res.ok ? 'Client added.' : (res.error ?? 'Something went wrong.'))
      }}
    >
      <div className="text-sm font-semibold">Add client</div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <input name="name" required placeholder="Client name" className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40" />
        <input name="email" placeholder="Email" className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40" />
        <input name="phone" placeholder="Phone" className="rounded-xl border border-[rgba(var(--kx-border),.12)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-300/40" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button disabled={pending} className="rounded-xl bg-cyan-400/20 border border-cyan-300/30 px-3 py-2 text-sm hover:bg-cyan-400/25 disabled:opacity-60">
          {pending ? 'Saving…' : 'Create'}
        </button>
        {msg && <div className="text-sm kx-muted">{msg}</div>}
      </div>
    </form>
  )
}
