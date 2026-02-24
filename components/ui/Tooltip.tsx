"use client";

import * as React from "react";

type Props = {
  text: string;
  children: React.ReactNode;
  /** Optional: prefer click-to-open (useful for mobile) */
  mode?: "auto" | "click";
};

export function Tooltip({ text, children, mode = "auto" }: Props) {
  const wrapRef = React.useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = React.useState(false);

  // Detect coarse pointer (touch) for auto mode
  const isTouch = React.useMemo(() => {
    if (mode === "click") return true;
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(pointer: coarse)").matches ?? false;
  }, [mode]);

  React.useEffect(() => {
    if (!open) return;

    function onDoc(e: MouseEvent | TouchEvent) {
      const el = wrapRef.current;
      if (!el) return;
      const target = e.target as Node | null;
      if (target && el.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className={"kx-tooltip-wrap" + (open ? " is-open" : "")}
      onMouseEnter={() => {
        if (isTouch) return;
        setOpen(true);
      }}
      onMouseLeave={() => {
        if (isTouch) return;
        setOpen(false);
      }}
      onFocus={() => {
        if (isTouch) return;
        setOpen(true);
      }}
      onBlur={() => {
        if (isTouch) return;
        setOpen(false);
      }}
      onClick={() => {
        if (!isTouch) return;
        setOpen((v) => !v);
      }}
    >
      {children}
      <span className="kx-tooltip" role="tooltip" aria-hidden={!open && isTouch}>
        {text}
      </span>
    </span>
  );
}

export function TipIcon({ text }: { text: string }) {
  return (
    <Tooltip text={text}>
      <button
        type="button"
        className="kx-icon-btn"
        style={{ height: 28, width: 28, borderRadius: 12 }}
        aria-label="Info"
      >
        i
      </button>
    </Tooltip>
  );
}
