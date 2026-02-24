"use client";

import * as React from "react";

export function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <span className="kx-tooltip-wrap">
      {children}
      <span className="kx-tooltip">{text}</span>
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
