"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

type Member = {
  user_id: string;
  role: string;
  created_at: string;
};

type Invite = {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

const ROLES = [
  { value: "staff", label: "Staff" },
  { value: "accounts", label: "Accounts" },
  { value: "manager", label: "Manager" },
];

export function TeamManager() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [invites, setInvites] = React.useState<Invite[]>([]);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("staff");
  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function refresh() {
    const supabase = createClient();
    const { data: cid, error: cidErr } = await supabase.rpc("current_company_id");
    if (cidErr) throw cidErr;

    const { data: m, error: mErr } = await supabase
      .from("company_users")
      .select("user_id,role,created_at")
      .eq("company_id", cid as any)
      .order("created_at", { ascending: true });
    if (mErr) throw mErr;

    const { data: inv, error: invErr } = await supabase
      .from("company_invites")
      .select("id,email,role,status,created_at")
      .eq("company_id", cid as any)
      .order("created_at", { ascending: false });
    if (invErr) throw invErr;

    setMembers((m as any) || []);
    setInvites((inv as any) || []);
  }

  React.useEffect(() => {
    refresh().catch(() => {});
  }, []);

  async function invite() {
    setError(null);
    setToast(null);

    const v = email.trim().toLowerCase();
    if (!v || !v.includes("@")) {
      setError("Enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: v, role }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Invite failed");

      setToast(j?.invited ? "Invite sent ✓" : "Invite saved ✓");
      setEmail("");
      setTimeout(() => setToast(null), 2600);

      await refresh();
    } catch (e: any) {
      setError(e?.message || "Invite failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {toast ? (
        <div className="pointer-events-none absolute -top-2 right-0 z-10">
          <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/85 shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop-blur-md">
            {toast}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-2xl bg-[rgba(255,0,80,.10)] px-4 py-3 text-sm text-[rgb(var(--kx-fg))]">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block md:col-span-2">
          <div className="text-xs kx-muted mb-1">Invite by email</div>
          <input className="kx-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@company.com" inputMode="email" />
        </label>

        <label className="block">
          <div className="text-xs kx-muted mb-1">Role</div>
          <select className="kx-input" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-3">
          <button className="kx-button kx-button-primary" type="button" onClick={invite} disabled={loading}>
            {loading ? "Inviting…" : "Send invite"}
          </button>
          <div className="mt-2 text-[11px] kx-muted2">
            If <span className="kx-muted">SUPABASE_SERVICE_ROLE_KEY</span> is set, the system will email an invite automatically. Otherwise it stores the invite so you can follow up manually.
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-4">
          <div className="text-sm font-semibold">Members</div>
          <div className="mt-3 space-y-2 text-sm">
            {members.length ? (
              members.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between gap-3">
                  <div className="text-xs kx-muted break-all">{m.user_id}</div>
                  <span className="kx-chip">{m.role}</span>
                </div>
              ))
            ) : (
              <div className="kx-muted">No members found.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-4">
          <div className="text-sm font-semibold">Invites</div>
          <div className="mt-3 space-y-2 text-sm">
            {invites.length ? (
              invites.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm truncate">{i.email}</div>
                    <div className="text-[11px] kx-muted2">Status: {i.status}</div>
                  </div>
                  <span className="kx-chip">{i.role}</span>
                </div>
              ))
            ) : (
              <div className="kx-muted">No invites yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
