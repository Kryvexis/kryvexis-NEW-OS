"use client";
import * as React from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";

export function ResponsiveShell({ sidebar, topbar, children }: { sidebar: React.ReactNode; topbar: React.ReactNode; children: React.ReactNode; }) {
  const isMobile = useMediaQuery("(max-width: 860px)");
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => { if (!isMobile) setOpen(false); }, [isMobile]);

  return (
    <div className="kx-shell kx-app">
      {!isMobile && <aside className="kx-sidebar">{sidebar}</aside>}

      {isMobile && (
        <>
          <button type="button" className="kx-hamburger" aria-label="Open menu" onClick={() => setOpen(true)}>☰</button>
          <div className={["kx-drawer", open ? "is-open" : ""].join(" ")} aria-hidden={!open}>
            <div className="kx-drawer-panel">
              <div className="kx-drawer-top">
                <div className="kx-drawer-title">Menu</div>
                <button type="button" className="kx-icon-btn" aria-label="Close menu" onClick={() => setOpen(false)}>✕</button>
              </div>
              <div onClick={() => setOpen(false)}>{sidebar}</div>
            </div>
            <button type="button" className="kx-drawer-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
          </div>
        </>
      )}

      <div className="kx-main">
        <header className="kx-topbar">{topbar}</header>
        <main className="kx-content">{children}</main>
      </div>
    </div>
  );
}
