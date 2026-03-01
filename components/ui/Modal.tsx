"use client";

import * as React from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    // Prevent background scrolling on mobile
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[520px] overflow-hidden rounded-3xl border border-white/10 bg-[rgba(var(--kx-shell),.92)] shadow-[0_30px_120px_rgba(0,0,0,.55)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="text-sm font-semibold tracking-tight text-[rgba(var(--kx-fg),.92)]">{title}</div>
          <button className="kx-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
