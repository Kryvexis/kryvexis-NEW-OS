'use client'

import * as React from 'react'
import { Card } from '@/components/card'

type Row = { role: string; module: string; enabled: boolean }

const MODULE_LABEL: Record<string, string> = {
  sales: 'Sales',
  procurement: 'Procurement',
  accounting: 'Accounting',
  operations: 'Operations',
  insights: 'Insights',
  settings: 'Settings',
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  cashier: 'Cashier',
  staff: 'Staff',
  buyer: 'Buyer',
  accounts: 'Accounts',
}

function keyOf(role: string, module: string) {
  return `${role}::${module}`
}

export default function RoleModulesClient() {
  const [busyKey, setBusyKey] = React.useState<string | null>(null)
  const [msg, setMsg] = React.useState<string | null>(null)
  const [roles, setRoles] = React.useState<string[]>([])
  const [modules, setModules] = React.useState<string[]>([])
  const [rows, setRows] = React.useState<Row[]>([])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/team/role-modules', { method: 'GET' })
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.error || 'Failed to load role access')
        if (cancelled) return
        setRoles(json?.roles || [])
        setModules(json?.modules || [])
        setRows(json?.rows || [])
      } catch (e: any) {
        if (!cancelled) setMsg(e?.message || 'Failed to load role access')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const map = React.useMemo(() => {
    const m = new Map<string, boolean>()
    for (const r of rows) m.set(keyOf(r.role, r.module), !!r.enabled)
    return m
  }, [rows])

  async function toggle(role: string, module: string, enabled: boolean) {
    setMsg(null)
    const k = keyOf(role, module)
    setBusyKey(k)
    try {
      const res = await fetch('/api/team/role-modules', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role, module, enabled }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Update failed')
      setRows((prev) => {
        const next = prev.filter((x) => !(x.role === role && x.module === module))
        next.push({ role, module, enabled })
        return next
      })
      setMsg('Role access updated ✅')
    } catch (e: any) {
      setMsg(e?.message || 'Update failed')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">Role access</div>
          <div className="mt-1 text-sm kx-muted">Turn modules on/off per role. Managers see everything; this controls everyone else.</div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left kx-muted">
              <th className="py-2 pr-3">Role</th>
              {modules.map((m) => (
                <th key={m} className="py-2 pr-3">
                  {MODULE_LABEL[m] || m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roles
              .filter((r) => r !== 'owner')
              .map((r) => (
                <tr key={r} className="border-t border-[rgba(var(--kx-border),.10)]">
                  <td className="py-2 pr-3 font-medium">{ROLE_LABEL[r] || r}</td>
                  {modules.map((m) => {
                    const k = keyOf(r, m)
                    const on = map.get(k) ?? false
                    const busy = busyKey === k
                    return (
                      <td key={m} className="py-2 pr-3">
                        <button
                          className={
                            'inline-flex h-9 w-[92px] items-center justify-center rounded-kx text-xs font-semibold transition ' +
                            (on ? 'bg-[rgb(var(--kx-accent)/.95)] text-white' : 'bg-kx-surface2 text-[rgb(var(--kx-fg)/.80)]')
                          }
                          disabled={busy}
                          onClick={() => toggle(r, m, !on)}
                        >
                          {busy ? 'Saving…' : on ? 'Enabled' : 'Hidden'}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {msg ? <div className="mt-3 text-sm kx-muted">{msg}</div> : null}
    </Card>
  )
}
