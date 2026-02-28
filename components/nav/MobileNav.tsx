"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navBottomItems, navMainItems, NavIcon } from "@/components/nav";
import ThemeToggle from "@/components/theme/ThemeToggle";

type MobileNavProps = {
  userEmail?: string;
};

export default function MobileNav({ userEmail }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname() || "";

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const renderItem = (href: string, label: string, iconName?: any) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className={
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition " +
          (active
            ? "bg-[rgba(var(--kx-accent),.14)] text-[rgba(var(--kx-fg),.95)] ring-1 ring-white/5 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
            : "bg-[rgba(var(--kx-fg),.04)] text-[rgba(var(--kx-fg),.88)] ring-1 ring-white/5 hover:bg-[rgba(var(--kx-fg),.08)]")
        }
        onClick={() => setOpen(false)}
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[rgba(var(--kx-fg),.06)] text-[rgba(var(--kx-fg),.85)]">
          {iconName ? <NavIcon name={iconName} /> : <span className="text-xs">•</span>}
        </span>
        <span className="flex-1">{label}</span>
      </Link>
    );
  };

  return (
    <>
      <button
        data-tour="mobile-nav"
        className="kx-icon-btn md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {/* Overlay */}
      <div
        className={
          "fixed inset-0 z-50 transition " +
          (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
        }
        aria-hidden={!open}
      >
        <div
          className={"absolute inset-0 kx-overlay"}
          onClick={() => setOpen(false)}
        />
        {/* Drawer */}
        <div
          className={
            "absolute left-0 top-0 h-full w-[88%] max-w-[360px] transform transition duration-300 " +
            (open ? "translate-x-0" : "-translate-x-full")
          }
          role="dialog"
          aria-modal="true"
        >
          <div className="h-full bg-[rgba(var(--kx-shell),.92)] backdrop-blur-xl shadow-[var(--kx-shadow)] ring-1 ring-white/5">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/kryvexis-logo.png"
                  alt="Kryvexis"
                  width={64}
                  height={64}
                  className="h-14 w-14 object-contain"
                  priority
                  style={{ filter: "drop-shadow(0 0 14px rgba(var(--kx-accent), .22))" }}
                />
                <div>
                  <div className="text-sm font-semibold tracking-tight">Kryvexis OS</div>
                  <div className="text-xs kx-muted">{userEmail ?? "Signed in"}</div>
                </div>
              </div>
              <button className="kx-icon-btn" onClick={() => setOpen(false)} aria-label="Close menu">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="text-xs kx-muted">Theme</div>
                <ThemeToggle />
              </div>
            </div>

            <div className="px-4">
              <div className="text-[11px] uppercase tracking-widest kx-muted2 mb-2">Navigation</div>
              <div className="grid gap-2">
                {navMainItems.map((n) => renderItem(n.href, n.label, n.icon))}
              </div>

              <div className="mt-5 text-[11px] uppercase tracking-widest kx-muted2 mb-2">Tools</div>
              <div className="grid gap-2 pb-6">
                {navBottomItems.map((n) => renderItem(n.href, n.label, n.icon))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
