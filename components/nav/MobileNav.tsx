"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import type { UserRole } from "@/lib/roles/shared";

const NAV = [
  { label: "Dashboard", href: "/dashboard", roles: ["owner", "manager", "cashier", "staff", "accounts"] as UserRole[] },
  { label: "Clients", href: "/clients", roles: ["owner", "manager", "cashier", "staff", "accounts"] as UserRole[] },
  { label: "Buyers", href: "/buyers", roles: ["owner", "manager", "buyer"] as UserRole[] },
  { label: "Products", href: "/products", roles: ["owner", "manager", "buyer"] as UserRole[] },
  { label: "Suppliers", href: "/suppliers", roles: ["owner", "manager", "buyer"] as UserRole[] },
  { label: "Quotes", href: "/quotes", roles: ["owner", "manager", "cashier", "staff"] as UserRole[] },
  { label: "Invoices", href: "/invoices", roles: ["owner", "manager", "cashier", "staff", "accounts"] as UserRole[] },
  { label: "Payments", href: "/payments", roles: ["owner", "manager", "cashier", "staff", "accounts"] as UserRole[] },
  { label: "Accounting", href: "/accounting/dashboard", roles: ["owner", "manager", "accounts"] as UserRole[] },
  { label: "Reports", href: "/reports", roles: ["owner", "manager", "accounts"] as UserRole[] },
  { label: "Operations", href: "/operations", roles: ["owner", "manager", "buyer"] as UserRole[] },
  { label: "Settings", href: "/settings", roles: ["owner", "manager", "cashier", "buyer", "accounts", "staff"] as UserRole[] },
  { label: "Help", href: "/help", roles: ["owner", "manager", "cashier", "buyer", "accounts", "staff"] as UserRole[] },
  { label: "Import Center", href: "/import-station", roles: ["owner", "manager"] as UserRole[] },
  { label: "Account Center", href: "/account-center", roles: ["owner", "manager"] as UserRole[] },
] as const;

type MobileNavProps = {
  userEmail?: string
  role: UserRole
}

export default function MobileNav(props: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      <button  data-tour="mobile-nav" className="kx-icon-btn md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
        ☰
      </button>

      <Modal open={open} title="Menu" onClose={() => setOpen(false)}>
        <div className="grid gap-2">
          {NAV.filter((it) => it.roles.includes(props.role) || props.role === 'owner' || props.role === 'manager').map((it) => {
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
