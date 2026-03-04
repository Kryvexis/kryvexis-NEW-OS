"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import type { UserRole } from "@/lib/roles/shared";
import type { AppModule } from "@/lib/rbac-shared";

const NAV = [
  { label: "Sales", href: "/sales/pos", module: "sales" as AppModule },
  { label: "Procurement", href: "/buyers", module: "procurement" as AppModule },
  { label: "Accounting", href: "/accounting/dashboard", module: "accounting" as AppModule },
  { label: "Operations", href: "/operations", module: "operations" as AppModule },
  { label: "Insights", href: "/insights", module: "insights" as AppModule },
  { label: "Settings", href: "/settings", module: "settings" as AppModule },
] as const;

type MobileNavProps = {
  userEmail?: string
  role?: UserRole
  modules?: AppModule[]
}

export default function MobileNav(props: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const role: UserRole = props.role ?? "staff";
  const modules = props.modules ?? ['sales', 'settings']
  const canSee = (module: AppModule) => role === 'owner' || role === 'manager' || modules.includes(module)

  return (
    <>
      <button data-tour="mobile-nav" className="kx-icon-btn md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
        ☰
      </button>

      <Modal open={open} title="Menu" onClose={() => setOpen(false)}>
        <div className="grid gap-2">
          {NAV.filter((it) => canSee(it.module)).map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + '/');
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  "block rounded-xl border px-3 py-3 text-sm transition " +
                  (active
                    ? "border-white/15 bg-[rgba(var(--kx-border),.10)] text-[rgba(var(--kx-fg),.92)]"
                    : "border-[rgba(var(--kx-fg),.12)] bg-[rgba(var(--kx-fg),.05)] text-[rgba(var(--kx-fg),.92)]/80 hover:bg-[rgba(var(--kx-fg),.10)] hover:text-[rgba(var(--kx-fg),.92)]")
                }
                onClick={() => setOpen(false)}
              >
                {it.label}
              </Link>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
