import type { UserRole } from '@/lib/roles/shared'

export type NavItem = {
  href: string
  label: string
  icon: 'sales' | 'accounting' | 'operations' | 'insights' | 'settings' | 'help' | 'accountCenter' | 'upload'
  roles?: UserRole[]
}

/**
 * Main navigation sections (top of sidebar)
 */
export const navMainItems: NavItem[] = [
  { href: '/sales', label: 'Sales', icon: 'sales', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'] },
  { href: '/accounting', label: 'Accounting', icon: 'accounting', roles: ['owner', 'manager', 'accounts'] },
  { href: '/operations', label: 'Operations', icon: 'operations', roles: ['owner', 'manager', 'buyer'] },
  { href: '/insights', label: 'Insights', icon: 'insights', roles: ['owner', 'manager'] },
]

/**
 * Footer navigation (near sidebar bottom)
 * Import Center must be second-to-last.
 */
export const navBottomItems: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: 'settings', roles: ['owner', 'manager'] },
  { href: '/help', label: 'Help', icon: 'help' },
  { href: '/import-station', label: 'Import Center', icon: 'upload', roles: ['owner', 'manager', 'buyer', 'accounts'] },
  { href: '/account-center', label: 'Account Center', icon: 'accountCenter', roles: ['owner', 'manager', 'cashier', 'staff', 'buyer', 'accounts'] },
]
