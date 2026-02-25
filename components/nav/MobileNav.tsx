"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

const NAV = [
  ["Dashboard", "/dashboard"],
  ["Clients", "/clients"],
  ["Products", "/products"],
  ["Suppliers", "/suppliers"],
  ["Quotes", "/quotes"],
  ["Invoices", "/invoices"],
  ["Payments", "/payments"],
  ["Accounts", "/accounts"],
  ["Reports", "/reports"],
  ["Settings", "/settings"],
  ["Help", "/help"],
  ["Import Center", "/import-station"],
  ["Account Center", "/account-center"],
] as const;

export default function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      <button  data-tour="mobile-nav" className="kx-icon-btn md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
        ☰
      </button>

      <Modal open={open} title="Menu" onClose={() => setOpen(false)}>
        <div className="grid gap-2">
          {NAV.map(([label, href]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  "block rounded-xl border px-3 py-2 text-sm transition " +
                  (active
                    ? "border-[rgba(var(--kx-border),.24)] bg-[rgba(var(--kx-border),.10)] text-[rgba(var(--kx-fg),.92)]"
                    : "border-[rgba(var(--kx-fg),.12)] bg-[rgba(var(--kx-fg),.05)] text-[rgba(var(--kx-fg),.92)]/80 hover:bg-[rgba(var(--kx-fg),.10)] hover:text-[rgba(var(--kx-fg),.92)]")
                }
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
