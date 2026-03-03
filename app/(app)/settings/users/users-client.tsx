'use client'

import * as React from 'react'
import { Card } from '@/components/card'

type MemberRow = {
  user_id: string
  email: string
  full_name?: string
  role: string
}

const ROLES = [
  { value: 'cashier', label: 'Cashier' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
] as const

export default function UsersClient({ initialMembers }: { initialMembers: MemberRow[] }) {
  const [members, setMembers] = React.useState<MemberRow[]>(initialMembers)
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteRole, setInviteRole] = React.useState<string>('cashier')
  const [busy, setBusy] = React.useState<string | null>(null)
  const [msg, setMsg] = React.useState<string | null>(null)

  async function invite() {
    setMsg(null)
    setBusy('invite')
    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Invite failed')
      setMsg(json?.invited ? 'Invite sent ✅' : 'Invite created (no email sent) ✅')
      setInviteEmail('')
    } catch (e: any) {
      setMsg(e?.message || 'Invite failed')
    } finally {
      setBusy(null)
    }
  }

  async function updateRole(user_id: string, role: string) {
    setMsg(null)
    setBusy(user_id)
    try {
      const res = await fetch('/api/team/role', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ user_id, role }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Update failed')
      setMembers((prev) => prev.map((m) => (m.user_id === user_id ? { ...m, role } : m)))
      setMsg('Role updated ✅')
    } catch (e: any) {
      setMsg(e?.message || 'Update failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <div className="text-sm font-semibold">Invite user</div>
            <div className="mt-1 text-sm kx-muted">Add a staff member and pick what they should see.</div>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              className="kx-input w-full md:w-[260px]"
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select className="kx-input md:w-[160px]" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button className="kx-btn-primary" disabled={busy === 'invite' || !inviteEmail.trim()} onClick={invite}>
              {busy === 'invite' ? 'Inviting…' : 'Invite'}
            </button>
          </div>
        </div>
        {msg ? <div className="mt-3 text-sm kx-muted">{msg}</div> : null}
      </Card>

      <Card>
        <div className="text-sm font-semibold">Members</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left kx-muted">
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.user_id} className="border-t border-[rgba(var(--kx-border),.10)]">
                  <td className="py-2 pr-3">
                    {m.full_name || <span className="kx-muted">{m.user_id.slice(0, 8)}…</span>}
                  </td>
                  <td className="py-2 pr-3">{m.email || <span className="kx-muted">(email hidden)</span>}</td>
                  <td className="py-2 pr-3">
                    <select
                      className="kx-input"
                      value={m.role}
                      onChange={(e) => updateRole(m.user_id, e.target.value)}
                      disabled={busy === m.user_id}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
