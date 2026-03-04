import type { UserRole } from '@/lib/roles/shared'
import type { AppModule } from '@/lib/rbac'

export type NavItem = {
  label: string
  href: string
  roles: UserRole[]
  modules?: AppModule[]
}

// Central nav list for mobile/menu filtering.
// Modules are OPTIONAL (if omitted, item is always allowed by module filtering).
export const NAV: readonly NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'], modules: ['sales', 'insights'] },
  { label: 'POS', href: '/sales/pos', roles: ['owner', 'manager', 'cashier', 'staff'], modules: ['sales'] },
  { label: 'Clients', href: '/clients', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'], modules: ['sales'] },
  { label: 'Quotes', href: '/quotes', roles: ['owner', 'manager', 'cashier', 'staff'], modules: ['sales'] },
  { label: 'Invoices', href: '/invoices', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'], modules: ['sales'] },
  { label: 'Payments', href: '/payments', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'], modules: ['sales', 'accounting'] },

  // Procurement
  { label: 'Buyers', href: '/buyers', roles: ['owner', 'manager', 'buyer'], modules: ['procurement'] },
  { label: 'Suppliers', href: '/suppliers', roles: ['owner', 'manager', 'buyer'], modules: ['procurement'] },

  // Operations
  { label: 'Products', href: '/products', roles: ['owner', 'manager', 'buyer'], modules: ['operations'] },
  { label: 'Operations', href: '/operations', roles: ['owner', 'manager', 'buyer'], modules: ['operations'] },

  // Accounting
  { label: 'Accounting', href: '/accounting/dashboard', roles: ['owner', 'manager', 'accounts'], modules: ['accounting'] },
  { label: 'Reports', href: '/reports', roles: ['owner', 'manager', 'accounts'], modules: ['insights', 'accounting'] },

  // Bottom / utility
  { label: 'Settings', href: '/settings', roles: ['owner', 'manager', 'cashier', 'buyer', 'accounts', 'staff'], modules: ['settings'] },
  { label: 'Help', href: '/help', roles: ['owner', 'manager', 'cashier', 'buyer', 'accounts', 'staff'] },
  { label: 'Import Center', href: '/import-station', roles: ['owner', 'manager'], modules: ['operations'] },
  { label: 'Account Center', href: '/account-center', roles: ['owner', 'manager'] },
] as const
