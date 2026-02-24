"use client";

import * as React from "react";

type KeyOf<T> = Extract<keyof T, string>;

export default function LimitedList<T extends Record<string, any>>({
  items,
  searchKeys,
  initialCount = 5,
  emptyText = "No items yet.",
  placeholder = "Search…",
  render,
}: {
  items: T[];
  searchKeys: KeyOf<T>[];
  initialCount?: number;
  emptyText?: string;
  placeholder?: string;
  render: (item: T) => React.ReactNode;
}) {
  const [q, setQ] = React.useState("");
  const [expanded, setExpanded] = React.useState(false);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items || [];
    return (items || []).filter((it) =>
      (searchKeys || []).some((k) => String(it?.[k] ?? "").toLowerCase().includes(s))
    );
  }, [items, q, searchKeys]);

  const visible = expanded ? filtered : filtered.slice(0, initialCount);
  const canExpand = filtered.length > initialCount;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <div className="text-xs text-white/55 uppercase tracking-wider">Search</div>
          <input
            className="kx-input w-full md:w-[320px] px-3 py-2"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setExpanded(false);
            }}
            placeholder={placeholder}
          />
          <div className="text-[11px] text-white/45">{filtered.length} match{filtered.length === 1 ? "" : "es"}</div>
        </div>

        {canExpand && (
          <button
            type="button"
            className="kx-button"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show less" : `View more (${filtered.length - initialCount})`}
          </button>
        )}
      </div>

      <div className="grid gap-2">
        {visible.map((it, idx) => (
          <React.Fragment key={(it as any)?.id ?? idx}>{render(it)}</React.Fragment>
        ))}
        {!visible.length && <div className="text-sm text-white/55">{emptyText}</div>}
      </div>
    </div>
  );
}
