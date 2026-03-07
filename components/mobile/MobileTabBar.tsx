"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, ShoppingCart, Receipt, Settings, Plus } from "lucide-react";
import { useHideOnScroll } from "./hooks/useHideOnScroll";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const tabs: Tab[] = [
  { href: "/m/home", label: "Home", icon: <Home className="h-5 w-5" /> },
  { href: "/m/buyers", label: "Buyers", icon: <ShoppingCart className="h-5 w-5" /> },
  { href: "/m/transactions", label: "Transactions", icon: <Receipt className="h-5 w-5" /> },
  { href: "/m/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export default function MobileTabBar() {
  const pathname = usePathname() || "/m/home";
  const hidden = useHideOnScroll({ threshold: 10, topAlwaysVisible: true });

  return (
    <div
      className={clsx(
        "fixed inset-x-0 bottom-0 z-50 transition-transform duration-200",
        hidden ? "translate-y-full" : "translate-y-0"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="relative rounded-2xl border border-black/5 bg-white/85 shadow-lg backdrop-blur dark:border-white/10 dark:bg-zinc-900/80">
          <Link
            href="/m/new"
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600 p-3 shadow-lg ring-4 ring-white/70 dark:ring-zinc-900/60"
            aria-label="New"
          >
            <Plus className="h-6 w-6 text-white" />
          </Link>

          <nav className="grid grid-cols-4 gap-1 px-2 pt-4">
            {tabs.map((t) => {
              const active = pathname === t.href || pathname.startsWith(t.href + "/");
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={clsx(
                    "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium",
                    active
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  )}
                >
                  <span className={clsx("rounded-xl p-2", active ? "bg-emerald-600/10" : "bg-transparent")}>{t.icon}</span>
                  {t.label}
                </Link>
              );
            })}
          </nav>

          <div className="h-3" />
        </div>
      </div>
    </div>
  );
}
