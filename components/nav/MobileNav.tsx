"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import type { UserRole } from "@/lib/roles/shared";
import type { AppModule } from "@/lib/rbac-shared";
import { NAV } from "@/components/nav/nav-items";

export default function MobileNav({ role, modules }: { role: UserRole; modules: AppModule[] }) {
  const pathname = usePathname() || "/dashboard";
  const [open, setOpen] = React.useState(false);
  const moduleSet = new Set(modules || []);

  const items = NAV.filter((it) => {
    const canByRole = it.roles.includes(role) || role === "owner" || role === "manager";
    const canByModule = !it.modules || it.modules.some((m) => moduleSet.has(m));
    return canByRole && canByModule;
  });

  return (
    <>
      <button
        type="button"
        className="md:hidden inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium"
        style={{ borderColor: "rgb(var(--kx-border) / 0.18)" }}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        Menu
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Menu">
        <div className="flex flex-col gap-1">
          {items.map((it) => {
            const active = pathname === it.href || (it.href !== "/dashboard" && pathname.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className={[
                  "flex items-center justify-between rounded-xl px-3 py-3 text-sm",
                  active ? "bg-black/5 font-semibold" : "hover:bg-black/5",
                ].join(" ")}
              >
                <span className="truncate">{it.label}</span>
                {active ? <span className="h-2 w-2 rounded-full bg-black/70" /> : null}
              </Link>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
