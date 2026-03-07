import type { UserRole } from '@/lib/roles/shared'

export type NavItem = {
  href: string
  label: string
  icon:
    | 'sales'
    | 'buyers'
    | 'accounting'
    | 'operations'
    | 'insights'
    | 'settings'
    | 'help'
    | 'accountCenter'
    | 'upload'
  roles?: UserRole[]
}

export const navMainItems: NavItem[] = [
  { href: '/sales', label: 'Sales', icon: 'sales', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'] },
  { href: '/buyers', label: 'Buyers', icon: 'buyers', roles: ['owner', 'manager', 'buyer'] },
  { href: '/accounting', label: 'Accounting', icon: 'accounting', roles: ['owner', 'manager', 'accounts'] },
  { href: '/operations', label: 'Operations', icon: 'operations', roles: ['owner', 'manager', 'buyer'] },
  { href: '/insights', label: 'Insights', icon: 'insights', roles: ['owner', 'manager'] },
]

export const navBottomItems: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: 'settings', roles: ['owner', 'manager'] },
  { href: '/help', label: 'Help', icon: 'help' },
  { href: '/import-station', label: 'Import Center', icon: 'upload', roles: ['owner', 'manager', 'buyer', 'accounts'] },
  { href: '/account-center', label: 'Account Center', icon: 'accountCenter', roles: ['owner', 'manager', 'cashier', 'staff', 'buyer', 'accounts'] },
]
