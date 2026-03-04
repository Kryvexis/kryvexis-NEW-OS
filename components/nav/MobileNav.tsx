use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import type { AppModule, UserRole } from "@/lib/roles/shared";

type NavItem = {
  label: string;
  href: string;
  roles: UserRole[];
  modules?: AppModule[];
};

const NAV: readonly NavItem[] = [
  { label: "Sales", href: "/sales/pos", roles: ["owner", "manager", "cashier", "staff", "accounts"], modules: ["sales"] },
  { label: "Clients", href: "/clients", roles: ["owner", "manager", "cashier", "staff", "accounts"], modules: ["sales"] },
  { label: "Quotes", href: "/quotes", roles: ["owner", "manager", "cashier", "staff"], modules: ["sales"] },
  { label: "Invoices", href: "/invoices", roles: ["owner", "manager", "cashier", "staff", "accounts"], modules: ["sales"] },
  { label: "Payments", href: "/payments", roles: ["owner", "manager", "cashier", "staff", "accounts"], modules: ["sales", "accounting"] },

  // Procurement
  { label: "Buyers", href: "/buyers", roles: ["owner", "manager", "buyer"], modules: ["procurement"] },
  { label: "Suppliers", href: "/suppliers", roles: ["owner", "manager", "buyer"], modules: ["procurement"] },

  // Operations
  { label: "Products", href: "/products", roles: ["owner", "manager", "buyer"], modules: ["operations", "procurement"] },
  { label: "Operations", href: "/operations", roles: ["owner", "manager", "buyer"], modules: ["operations"] },

  // Accounting
  { label: "Accounting", href: "/accounting/dashboard", roles: ["owner", "manager", "accounts"], modules: ["accounting"] },
  { label: "Reports", href: "/reports", roles: ["owner", "manager", "accounts"], modules: ["accounting", "insights"] },

  // Settings + misc
  { label: "Settings", href: "/settings", roles: ["owner", "manager", "cashier", "buyer", "accounts", "staff"], modules: ["settings"] },
  { label: "Help", href: "/help", roles: ["owner", "manager", "cashier", "buyer", "accounts", "staff"] },
  { label: "Import Center", href: "/import-station", roles: ["owner", "manager"], modules: ["operations"] },
  { label: "Account Center", href: "/account-center", roles: ["owner", "manager"], modules: ["settings"] },
];

type MobileNavProps = {
  userEmail?: string;
  role?: UserRole;
  modules?: AppModule[];
};

export default function MobileNav(props: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const role: UserRole = props.role ?? "staff";
  const moduleSet = React.useMemo(() => new Set<AppModule>(props.modules ?? []), [props.modules]);

  return (
    <>
      <button data-tour="mobile-nav" className="kx-icon-btn md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
        ☰
      </button>

      <Modal open={open} title="Menu" onClose={() => setOpen(false)}>
        <div className="grid gap-2">
          {NAV.filter((it) => {
            const canByRole = it.roles.includes(role) || role === "owner" || role === "manager";
            const canByModule = !it.modules || it.modules.some((m) => moduleSet.has(m));
            return canByRole && canByModule;
          }).map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + "/");
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
