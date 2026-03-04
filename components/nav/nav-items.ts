import type { UserRole } from "@/lib/roles/shared";
import type { AppModule } from "@/lib/rbac-shared";

export type NavItem = {
  label: string;
  href: string;
  icon: "dashboard" | "pos" | "invoices" | "quotes" | "clients" | "products" | "suppliers" | "buyers" | "accounting" | "operations" | "reports" | "settings";
  roles: UserRole[];
  modules?: AppModule[];
};

export const NAV: readonly NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard", roles: ["owner", "manager"], modules: ["sales", "insights"] },
  { label: "POS", href: "/sales/pos", icon: "pos", roles: ["owner", "manager", "cashier", "staff"], modules: ["sales"] },

  { label: "Invoices", href: "/invoices", icon: "invoices", roles: ["owner", "manager", "cashier", "staff", "accounts"], modules: ["sales", "accounting"] },
  { label: "Quotes", href: "/quotes", icon: "quotes", roles: ["owner", "manager", "cashier", "staff"], modules: ["sales"] },
  { label: "Clients", href: "/clients", icon: "clients", roles: ["owner", "manager", "cashier", "staff"], modules: ["sales"] },

  { label: "Products", href: "/products", icon: "products", roles: ["owner", "manager", "staff"], modules: ["operations"] },
  { label: "Suppliers", href: "/suppliers", icon: "suppliers", roles: ["owner", "manager", "buyer", "staff"], modules: ["procurement", "operations"] },
  { label: "Buyers", href: "/buyers", icon: "buyers", roles: ["owner", "manager", "buyer"], modules: ["procurement"] },

  { label: "Accounting", href: "/accounting/dashboard", icon: "accounting", roles: ["owner", "manager", "accounts"], modules: ["accounting"] },
  { label: "Operations", href: "/operations", icon: "operations", roles: ["owner", "manager", "staff"], modules: ["operations"] },
  { label: "Reports", href: "/reports", icon: "reports", roles: ["owner", "manager", "accounts"], modules: ["insights", "accounting"] },

  // Settings can be visible when modules includes settings, but we keep it optional to avoid typing issues.
  { label: "Settings", href: "/settings", icon: "settings", roles: ["owner", "manager"], modules: ["settings"] },
] as const;
