"use client";

import * as React from "react";
import { createPortal } from "react-dom";

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

  if (!open) return null;

  // Render in a portal to avoid positioning issues caused by parent stacking contexts.
  return createPortal(
    <div
      className="kx-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="kx-modal">
        <div className="kx-modal-header">
          <div className="kx-modal-title">{title}</div>
          <button className="kx-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="kx-modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
