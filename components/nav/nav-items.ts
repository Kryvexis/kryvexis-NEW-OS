import type { UserRole } from '@/lib/roles/shared'

export type AppModule =
  | 'dashboard'
  | 'clients'
  | 'buyers'
  | 'products'
  | 'suppliers'
  | 'quotes'
  | 'invoices'
  | 'payments'
  | 'accounting'
  | 'reports'
  | 'operations'
  | 'settings'
  | 'help'
  | 'import'
  | 'account-center'

export type NavItem = {
  label: string
  href: string
  roles: UserRole[]
  modules?: AppModule[]
}

export const MOBILE_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'] },
  { label: 'Clients', href: '/clients', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'] },
  { label: 'Buyers', href: '/buyers', roles: ['owner', 'manager', 'buyer'] },
  { label: 'Products', href: '/products', roles: ['owner', 'manager', 'buyer'] },
  { label: 'Suppliers', href: '/suppliers', roles: ['owner', 'manager', 'buyer'] },
  { label: 'Quotes', href: '/quotes', roles: ['owner', 'manager', 'cashier', 'staff'] },
  { label: 'Invoices', href: '/invoices', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'] },
  { label: 'Payments', href: '/payments', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'] },
  { label: 'Accounting', href: '/accounting/dashboard', roles: ['owner', 'manager', 'accounts'], modules: ['accounting'] },
  { label: 'Reports', href: '/reports', roles: ['owner', 'manager', 'accounts'], modules: ['reports'] },
  { label: 'Operations', href: '/operations', roles: ['owner', 'manager', 'buyer'], modules: ['operations'] },
  { label: 'Settings', href: '/settings', roles: ['owner', 'manager', 'cashier', 'buyer', 'accounts', 'staff'] },
  { label: 'Help', href: '/help', roles: ['owner', 'manager', 'cashier', 'buyer', 'accounts', 'staff'] },
  { label: 'Import Center', href: '/import-station', roles: ['owner', 'manager'], modules: ['import'] },
  { label: 'Account Center', href: '/account-center', roles: ['owner', 'manager'], modules: ['account-center'] },
]
