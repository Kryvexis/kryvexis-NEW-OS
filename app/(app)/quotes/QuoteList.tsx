"use client";

import Link from "next/link";
import LimitedList from "@/components/lists/LimitedList";
import { fmtZar } from "@/lib/format";

type QuoteRow = {
  id: string;
  number?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  status?: string | null;
  total?: number | null;
  clients?: { name?: string | null } | null;
  client_name?: string;
};

export default function QuoteList({ quotes }: { quotes: QuoteRow[] }) {
  return (
    <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] overflow-hidden">
      <div className="p-4 border-b border-[rgba(var(--kx-border),.12)]">
        <div className="text-sm font-semibold">Quotes</div>
        <div className="text-xs kx-muted2 mt-1">Showing max 5 by default. Use search + View more.</div>
      </div>

      <div className="p-4">
        <LimitedList
          items={quotes || []}
          searchKeys={["number", "status", "client_name"]}
          placeholder="Type e.g. W…"
          emptyText="No quotes yet. Create your first one."
          render={(q) => (
            <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] px-3 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-[rgba(var(--kx-fg),.92)]/90">{q.number ?? "—"}</div>
                  <div className="text-xs kx-muted">
                    {q.clients?.name ?? "—"} · Issue: {q.issue_date ?? "—"} · Exp: {q.expiry_date ?? "—"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="kx-chip">{q.status ?? "Draft"}</span>
                  <div className="text-sm text-[rgba(var(--kx-fg),.92)]/85 tabular-nums">{fmtZar(Number(q.total ?? 0))}</div>
                  <Link className="kx-button" href={`/quotes/${q.id}`}>View</Link>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
