"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import type { UserRole } from "@/lib/roles/shared";
import { MOBILE_NAV_ITEMS, type AppModule } from "@/components/nav/nav-items";

type MobileNavProps = {
  userEmail?: string
  role?: UserRole
  enabledModules?: AppModule[]
}

export default function MobileNav(props: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const role: UserRole = props.role ?? "staff";
  const moduleSet = new Set(props.enabledModules ?? []);

  return (
    <>
      <button  data-tour="mobile-nav" className="kx-icon-btn md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
        ☰
      </button>

      <Modal open={open} title="Menu" onClose={() => setOpen(false)}>
        <div className="grid gap-2">
          {MOBILE_NAV_ITEMS.filter((it) => {
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
