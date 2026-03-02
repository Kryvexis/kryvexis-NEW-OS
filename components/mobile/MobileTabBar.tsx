"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, Package, LineChart, Settings, Plus } from "lucide-react";
import { useHideOnScroll } from "./hooks/useHideOnScroll";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const tabs: Tab[] = [
  { href: "/m/home", label: "Home", icon: <Home className="h-5 w-5" /> },
  { href: "/m/buyers", label: "Buyers", icon: <Package className="h-5 w-5" /> },
  { href: "/m/sales", label: "Sales", icon: <LineChart className="h-5 w-5" /> },
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
          {/* Floating action */}
          <Link
            href="/sales/pos"
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 p-3 shadow-lg ring-4 ring-white/70 dark:ring-zinc-900/60"
            aria-label="New Sale"
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
                    "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs",
                    active
                      ? "text-blue-600"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  )}
                >
                  <span className={clsx("rounded-lg p-1.5 transition", active ? "bg-blue-600/10" : "bg-transparent")}>
                    {t.icon}
                  </span>
                  <span className={clsx(active ? "font-semibold" : "")}>{t.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
