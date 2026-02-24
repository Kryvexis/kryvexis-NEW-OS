"use client";

import * as React from "react";

type Entity = "products" | "clients" | "suppliers";

function parseCSV(csv: string): { headers: string[]; rows: Record<string,string>[] } {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return { headers: [], rows: [] };

  const splitLine = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; continue; }
        inQ = !inQ;
        continue;
      }
      if (ch === "," && !inQ) { out.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    out.push(cur.trim());
    return out;
  };

  const headers = splitLine(lines[0]).map((h) => h.replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((l) => {
    const cols = splitLine(l);
    const obj: Record<string,string> = {};
    headers.forEach((h, idx) => (obj[h] = (cols[idx] ?? "").replace(/^"|"$/g, "")));
    return obj;
  });
  return { headers, rows };
}

const TEMPLATES: Record<Entity, string> = {
  products: "name,sku,type,unit_price,stock_on_hand,low_stock_threshold,is_active\nWidget A,WID-A,product,99.99,10,2,true",
  clients: "name,email,phone,client_type\nWinston Trading,winston@example.com,0123456789,account",
  suppliers: "name,email,phone,notes\nAcme Supplies,orders@acme.com,0123456789,Preferred vendor",
};

const FIELD_HINTS: Record<Entity, string[]> = {
  products: ["Required: name", "Optional: sku,type(product|service),unit_price,stock_on_hand,low_stock_threshold,is_active(true|false)"],
  clients: ["Required: name", "Optional: email,phone,client_type(account|cash)"],
  suppliers: ["Required: name", "Optional: email,phone,notes"],
};

export default function ImportStation() {
  const [entity, setEntity] = React.useState<Entity>("products");
  const [csv, setCsv] = React.useState(TEMPLATES.products);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  React.useEffect(() => {
    setCsv(TEMPLATES[entity]);
    setMsg(null);
  }, [entity]);

  const parsed = React.useMemo(() => parseCSV(csv), [csv]);
  const preview = parsed.rows.slice(0, 5);

  async function runImport() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/import/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Import failed");
      setMsg({ kind: "ok", text: `Imported ${data.inserted ?? 0} row(s).` });
    } catch (e: any) {
      setMsg({ kind: "err", text: e?.message || "Import failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="kx-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["products","clients","suppliers"] as Entity[]).map((t) => (
            <button
              key={t}
              type="button"
              className={"kx-chip " + (entity === t ? "kx-chip-active" : "")}
              onClick={() => setEntity(t)}
            >
              {t === "products" ? "Products" : t === "clients" ? "Clients" : "Suppliers"}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="kx-button"
          onClick={() => navigator.clipboard.writeText(TEMPLATES[entity])}
        >
          Copy template
        </button>
      </div>

      <div className="mt-3 text-sm text-white/60">
        <ul className="list-disc pl-5 space-y-1">
          {FIELD_HINTS[entity].map((h) => <li key={h}>{h}</li>)}
        </ul>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <div className="text-xs text-white/55 uppercase tracking-wider">Paste CSV</div>
          <textarea
            className="kx-input w-full min-h-[220px] p-3 font-mono text-xs leading-relaxed"
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button type="button" className="kx-button" disabled={busy || parsed.rows.length === 0} onClick={runImport}>
              {busy ? "Importing…" : `Import ${parsed.rows.length} row(s)`}
            </button>
            {msg && (
              <div className={"text-sm " + (msg.kind === "ok" ? "text-emerald-300" : "text-rose-300")}>
                {msg.text}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-white/55 uppercase tracking-wider">Preview (first 5 rows)</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-auto">
            <table className="min-w-full text-xs">
              <thead className="sticky top-0 bg-black/30 backdrop-blur">
                <tr>
                  {parsed.headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-white/70 font-medium border-b border-white/10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((r, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    {parsed.headers.map((h) => (
                      <td key={h} className="px-3 py-2 text-white/80 whitespace-nowrap">
                        {r[h]}
                      </td>
                    ))}
                  </tr>
                ))}
                {!preview.length && (
                  <tr>
                    <td className="px-3 py-8 text-white/55" colSpan={Math.max(1, parsed.headers.length)}>
                      Paste CSV to preview.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-white/45">Only 5 rows are rendered in the preview to keep UI fast.</div>
        </div>
      </div>
    </div>
  );
}
