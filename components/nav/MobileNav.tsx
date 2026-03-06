"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import type { UserRole } from "@/lib/roles/shared";

type NavItem = {
  label: string;
  href: string;
  roles: UserRole[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const GROUPS: NavGroup[] = [
  {
    title: "Sales",
    items: [
      { label: "Dashboard", href: "/dashboard", roles: ["owner", "manager", "cashier", "staff", "accounts"] },
      { label: "Clients", href: "/clients", roles: ["owner", "manager", "cashier", "staff", "accounts"] },
      { label: "Quotes", href: "/quotes", roles: ["owner", "manager", "cashier", "staff"] },
      { label: "Invoices", href: "/invoices", roles: ["owner", "manager", "cashier", "staff", "accounts"] },
      { label: "Payments", href: "/payments", roles: ["owner", "manager", "cashier", "staff", "accounts"] },
    ],
  },
  {
    title: "Procurement",
    items: [
      { label: "Buyers", href: "/buyers", roles: ["owner", "manager", "buyer"] },
      { label: "Products", href: "/products", roles: ["owner", "manager", "buyer"] },
      { label: "Suppliers", href: "/suppliers", roles: ["owner", "manager", "buyer"] },
      { label: "Operations", href: "/operations", roles: ["owner", "manager", "buyer"] },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Accounting", href: "/accounting/dashboard", roles: ["owner", "manager", "accounts"] },
      { label: "Reports", href: "/reports", roles: ["owner", "manager", "accounts"] },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Import Center", href: "/import-station", roles: ["owner", "manager"] },
      { label: "Account Center", href: "/account-center", roles: ["owner", "manager"] },
      { label: "Settings", href: "/settings", roles: ["owner", "manager", "cashier", "buyer", "accounts", "staff"] },
      { label: "Help", href: "/help", roles: ["owner", "manager", "cashier", "buyer", "accounts", "staff"] },
    ],
  },
];

type MobileNavProps = {
  userEmail?: string;
  role?: UserRole;
};

function canSee(item: NavItem, role: UserRole) {
  return role === "owner" || role === "manager" || item.roles.includes(role);
}

export default function MobileNav(props: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const role: UserRole = props.role ?? "staff";

  return (
    <>
      <button data-tour="mobile-nav" className="kx-icon-btn md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
        ☰
      </button>

      <Modal open={open} title="Menu" onClose={() => setOpen(false)}>
        <div className="space-y-4">
          {GROUPS.map((group) => {
            const items = group.items.filter((it) => canSee(it, role));
            if (!items.length) return null;
            return (
              <section key={group.title} className="space-y-2">
                <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--kx-fg),.45)]">
                  {group.title}
                </div>
                <div className="grid gap-2">
                  {items.map((it) => {
                    const active = pathname === it.href || pathname.startsWith(it.href + "/");
                    return (
                      <Link
                        key={it.href}
                        href={it.href}
                        className={
                          "block rounded-xl border px-3 py-2.5 text-sm transition " +
                          (active
                            ? "border-transparent bg-[rgb(var(--kx-accent))] text-white shadow-[var(--kx-shadow-card)]"
                            : "border-[rgba(var(--kx-fg),.12)] bg-[rgba(var(--kx-fg),.05)] text-[rgba(var(--kx-fg),.92)]/80 hover:bg-[rgba(var(--kx-fg),.10)] hover:text-[rgba(var(--kx-fg),.92)]")
                        }
                        onClick={() => setOpen(false)}
                      >
                        {it.label}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
