"use client";
import * as React from "react";
export function MobileCardsList<T>({ items, render, empty }: { items: T[]; render: (item: T, index: number) => React.ReactNode; empty?: React.ReactNode; }) {
  if (!items?.length) return <div className="kx-empty">{empty ?? "Nothing here yet."}</div>;
  return <div className="kx-cards">{items.map((it, i) => <React.Fragment key={i}>{render(it, i)}</React.Fragment>)}</div>;
}
