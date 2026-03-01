"use client";

import * as React from "react";
import Link from "next/link";

export type ClientLite = {
  id: string;
  name: string;
  tags_json?: any;
  created_at?: string | null;
};

type Props = {
  clients: ClientLite[];
};

function normalizeTags(tags_json: any): string[] {
  if (!tags_json) return [];
  if (Array.isArray(tags_json)) return tags_json.map(String);
  try {
    const parsed = typeof tags_json === "string" ? JSON.parse(tags_json) : tags_json;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function classifyClient(c: ClientLite): "account" | "cash" {
  const tags = normalizeTags(c.tags_json).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("cash"))) return "cash";
  if (tags.some((t) => t.includes("account") || t.includes("credit"))) return "account";
  // default bucket
  return "account";
}

export default function ClientQuickPanel({ clients }: Props) {
  const [bucket, setBucket] = React.useState<"account" | "cash">("account");
  const [q, setQ] = React.useState("");
  const [showAll, setShowAll] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string>("");

  const bucketed = React.useMemo(() => {
    const acc: ClientLite[] = [];
    const cash: ClientLite[] = [];
    for (const c of clients || []) {
      (classifyClient(c) === "cash" ? cash : acc).push(c);
    }
    const byName = (a: ClientLite, b: ClientLite) => (a.name || "").localeCompare(b.name || "");
    acc.sort(byName);
    cash.sort(byName);
    return { account: acc, cash };
  }, [clients]);

  const active = bucketed[bucket] || [];
  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return active;
    return active.filter((c) => (c.name || "").toLowerCase().includes(s));
  }, [active, q]);

  const visible = showAll ? filtered : filtered.slice(0, 5);

  React.useEffect(() => {
    // reset selection if it no longer exists in bucket
    if (selectedId && !active.some((c) => c.id === selectedId)) setSelectedId("");
  }, [bucket, active, selectedId]);

  return (
    <div className="kx-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Clients</div>
          <div className="text-xs text-white/[0.55]">Pick a bucket, search, and open a client.</div>
        </div>
        <Link href="/clients" className="kx-button">View all</Link>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Dropdown 1: bucket */}
        <div className="grid gap-1.5">
          <div className="text-[11px] text-white/[0.55] uppercase tracking-wider">Client type</div>
          <select
            className="kx-input w-full px-3 py-2"
            value={bucket}
            onChange={(e) => { setBucket(e.target.value as any); setShowAll(false); }}
          >
            <option value="account">Account clients</option>
            <option value="cash">Cash clients</option>
          </select>
          <div className="text-[11px] text-white/45">Tip: tag clients with “cash” or “account”.</div>
        </div>

        {/* Dropdown 2: client */}
        <div className="grid gap-1.5">
          <div className="text-[11px] text-white/[0.55] uppercase tracking-wider">Select client</div>
          <select
            className="kx-input w-full px-3 py-2"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Choose…</option>
            {filtered.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selectedId ? (
            <Link className="text-xs kx-link mt-1" href={`/clients/${selectedId}`}>Open selected client →</Link>
          ) : (
            <div className="text-xs text-white/45 mt-1">Or use the list below.</div>
          )}
        </div>

        {/* Search */}
        <div className="grid gap-1.5">
          <div className="text-[11px] text-white/[0.55] uppercase tracking-wider">Search</div>
          <input
            className="kx-input w-full px-3 py-2"
            value={q}
            onChange={(e) => { setQ(e.target.value); setShowAll(false); }}
            placeholder="Type e.g. W…"
          />
          <div className="text-xs text-white/45">{filtered.length} match{filtered.length === 1 ? "" : "es"}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {visible.map((c) => (
          <Link
            key={c.id}
            href={`/clients/${c.id}`}
            className="flex items-center justify-between rounded-2xl border border-white/10 kx-card/5 px-3 py-2 hover:kx-card/10"
          >
            <span className="text-sm text-white/85">{c.name}</span>
            <span className="text-xs text-white/[0.55]">Open</span>
          </Link>
        ))}

        {!visible.length && (
          <div className="text-sm text-white/[0.55]">No clients in this bucket yet.</div>
        )}

        {filtered.length > 5 && (
          <button
            type="button"
            className="kx-button mt-1 w-fit"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? "Show less" : `View more (${filtered.length - 5})`}
          </button>
        )}
      </div>
    </div>
  );
}
