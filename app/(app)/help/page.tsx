"use client";
import * as React from "react";

const FAQ = [
  { cat:"Getting started", q:"How do I add a product?", a:"Go to Products → Add product/service → Save."},
  { cat:"Getting started", q:"How do I create a quote?", a:"Quotes → New Quote → Select client → Add items → Save."},
  { cat:"Billing", q:"How do I invoice?", a:"Convert a quote to invoice or create new invoice manually."},
  { cat:"Printing", q:"Why are print pages white?", a:"Print layouts are optimized for paper and PDF export."},
];

export default function HelpPage(){
  const [q,setQ]=React.useState("");
  const cats=[...new Set(FAQ.map(f=>f.cat))];

  return (
    <div className="grid gap-6">
      <div className="kx-card p-5">
        <div className="kx-h1">Help Center</div>
        <div className="kx-sub">Search guides and FAQs</div>
        <input
          className="kx-input mt-3 w-full p-2"
          placeholder="Search help..."
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
      </div>

      {cats.map(c=>(
        <div key={c} className="kx-card p-5">
          <div className="font-semibold text-[rgba(var(--kx-fg),.92)]/90 mb-2">{c}</div>
          <div className="grid gap-2">
            {FAQ.filter(f=>f.cat===c && (f.q.toLowerCase().includes(q.toLowerCase())||f.a.toLowerCase().includes(q.toLowerCase())))
              .map((f,i)=>(
                <div key={i} className="kx-panel p-3">
                  <div className="font-medium">{f.q}</div>
                  <div className="kx-muted text-sm mt-1">{f.a}</div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
