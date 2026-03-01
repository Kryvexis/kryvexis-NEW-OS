'use client'

import * as React from 'react'
import Link from 'next/link'

type ClientRow = {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  tags_json?: any
}

export default function SalesClientsClient({ clients }: { clients: ClientRow[] }) {
  const [q, setQ] = React.useState('')

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return clients
    return clients.filter((c) => {
      const hay = `${c.name || ''} ${c.email || ''} ${c.phone || ''}`.toLowerCase()
      return hay.includes(s)
    })
  }, [clients, q])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <input
          className="kx-input w-full md:max-w-[420px]"
          placeholder="Search clients by name, email or phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="text-sm kx-muted">{filtered.length} clients</div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-[rgba(var(--kx-fg),.045)]">
        <table className="w-full text-sm">
          <thead className="bg-[rgba(var(--kx-fg),.035)] kx-muted">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Client</th>
              <th className="hidden px-3 py-2 text-left font-semibold md:table-cell">Email</th>
              <th className="hidden px-3 py-2 text-left font-semibold md:table-cell">Phone</th>
              <th className="px-3 py-2 text-right font-semibold">Open</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[rgba(var(--kx-fg),.04)]">
                <td className="px-3 py-2">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs kx-muted md:hidden">{c.email || c.phone || '—'}</div>
                </td>
                <td className="hidden px-3 py-2 kx-muted md:table-cell">{c.email || '—'}</td>
                <td className="hidden px-3 py-2 kx-muted md:table-cell">{c.phone || '—'}</td>
                <td className="px-3 py-2 text-right">
                  <Link className="kx-button" href={`/clients/${c.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? (
          <div className="p-4 text-sm kx-muted">No matching clients.</div>
        ) : null}
      </div>
    </div>
  )
}
