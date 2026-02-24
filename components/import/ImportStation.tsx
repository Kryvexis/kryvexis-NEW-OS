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

function ImportBlock({ entity, title }: { entity: Entity; title: string }) {
  const [csv, setCsv] = React.useState(TEMPLATES[entity]);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [details, setDetails] = React.useState<{ inserted: number; skipped: number; errors: string[] } | null>(null);

  const parsed = React.useMemo(() => parseCSV(csv), [csv]);
  const preview = parsed.rows.slice(0, 5);

  async function onUpload(file?: File | null) {
    if (!file) return;
    const text = await file.text();
    setCsv(text);
    setMsg(null);
    setDetails(null);
  }

  async function runImport() {
    setBusy(true);
    setMsg(null);
    setDetails(null);
    try {
      const res = await fetch(`/api/import/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: parsed.rows }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Import failed");
      setDetails({
        inserted: Number(data.inserted ?? 0),
        skipped: Number(data.skipped ?? 0),
        errors: Array.isArray(data.errors) ? data.errors.slice(0, 10).map(String) : [],
      });
      setMsg({
        kind: "ok",
        text: `Imported ${data.inserted ?? 0} row(s). Skipped ${data.skipped ?? 0}.` +
          (Array.isArray(data.errors) && data.errors.length ? ` Errors: ${data.errors.length}.` : ""),
      });
    } catch (e: any) {
      setMsg({ kind: "err", text: e?.message || "Import failed" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-white/55 mt-1">CSV upload → preview → import</div>
        </div>
        <button type="button" className="kx-button" onClick={() => navigator.clipboard.writeText(TEMPLATES[entity])}>
          Copy template
        </button>
      </div>

      <div className="p-4 grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <div className="text-xs text-white/55 uppercase tracking-wider">Upload CSV</div>
          <input
            type="file"
            accept=".csv,text/csv"
            className="kx-input"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />

          <div className="text-xs text-white/55 uppercase tracking-wider mt-2">Or paste CSV</div>
          <textarea
            className="kx-input w-full min-h-[180px] p-3 font-mono text-xs leading-relaxed"
            value={csv}
            onChange={(e) => {
              setCsv(e.target.value);
              setMsg(null);
              setDetails(null);
            }}
          />

          <div className="mt-1 text-sm text-white/60">
            <ul className="list-disc pl-5 space-y-1">
              {FIELD_HINTS[entity].map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="kx-button" disabled={busy || parsed.rows.length === 0} onClick={runImport}>
              {busy ? "Importing…" : `Import ${parsed.rows.length} row(s)`}
            </button>
            {msg && (
              <div className={"text-sm " + (msg.kind === "ok" ? "text-emerald-300" : "text-rose-300")}>
                {msg.text}
              </div>
            )}
          </div>

          {details?.errors?.length ? (
            <div className="mt-2 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="text-xs text-white/60 mb-2">First {details.errors.length} issue(s)</div>
              <ul className="list-disc pl-5 text-xs text-white/70 space-y-1">
                {details.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          ) : null}
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
                      Upload or paste CSV to preview.
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

export default function ImportStation() {
  return (
    <div className="grid gap-5">
      <ImportBlock entity="clients" title="Import Clients" />
      <ImportBlock entity="products" title="Import Products" />
      <ImportBlock entity="suppliers" title="Import Suppliers" />
    </div>
  );
}
