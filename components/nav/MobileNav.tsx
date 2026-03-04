"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import type { AppModule, UserRole } from "@/lib/roles/shared";

const NAV = [
  { label: "Dashboard", href: "/dashboard", roles: ["owner", "manager", "cashier", "staff", "accounts"] as UserRole[], modules: ["sales"] as AppModule[] },
  { label: "Clients", href: "/clients", roles: ["owner", "manager", "cashier", "staff", "accounts"] as UserRole[], modules: ["sales"] as AppModule[] },
  { label: "Buyers", href: "/buyers", roles: ["owner", "manager", "buyer"] as UserRole[], modules: ["procurement", "operations"] as AppModule[] },
  { label: "Products", href: "/products", roles: ["owner", "manager", "buyer"] as UserRole[], modules: ["procurement", "operations"] as AppModule[] },
  { label: "Suppliers", href: "/suppliers", roles: ["owner", "manager", "buyer"] as UserRole[], modules: ["procurement", "operations"] as AppModule[] },
  { label: "Quotes", href: "/quotes", roles: ["owner", "manager", "cashier", "staff"] as UserRole[], modules: ["sales"] as AppModule[] },
  { label: "Invoices", href: "/invoices", roles: ["owner", "manager", "cashier", "staff", "accounts"] as UserRole[], modules: ["sales"] as AppModule[] },
  { label: "Payments", href: "/payments", roles: ["owner", "manager", "cashier", "staff", "accounts"] as UserRole[], modules: ["sales"] as AppModule[] },
  { label: "Accounting", href: "/accounting/dashboard", roles: ["owner", "manager", "accounts"] as UserRole[], modules: ["accounting"] as AppModule[] },
  { label: "Reports", href: "/reports", roles: ["owner", "manager", "accounts"] as UserRole[], modules: ["insights"] as AppModule[] },
  { label: "Operations", href: "/operations", roles: ["owner", "manager", "buyer"] as UserRole[], modules: ["procurement", "operations"] as AppModule[] },
  { label: "Settings", href: "/settings", roles: ["owner", "manager", "cashier", "buyer", "accounts", "staff"] as UserRole[] },
  { label: "Help", href: "/help", roles: ["owner", "manager", "cashier", "buyer", "accounts", "staff"] as UserRole[] },
  { label: "Import Center", href: "/import-station", roles: ["owner", "manager"] as UserRole[] },
  { label: "Account Center", href: "/account-center", roles: ["owner", "manager"] as UserRole[] },
] as const;

type MobileNavProps = {
  userEmail?: string
  role?: UserRole
  enabledModules: AppModule[]
}

export default function MobileNav(props: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const role: UserRole = props.role ?? "staff";
  const moduleSet = new Set(props.enabledModules);

  return (
    <>
      <button  data-tour="mobile-nav" className="kx-icon-btn md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
        ☰
      </button>

      <Modal open={open} title="Menu" onClose={() => setOpen(false)}>
        <div className="grid gap-2">
          {NAV.filter((it) => {
            const canByRole = it.roles.includes(role) || role === "owner" || role === "manager";
            const canByModule = !it.modules || it.modules.some((m) => moduleSet.has(m));
            return canByRole && canByModule;
          }).map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={
                  "block rounded-xl border px-3 py-2 text-sm transition " +
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
