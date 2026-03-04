import type { UserRole } from '@/lib/roles/shared';
import type { AppModule } from '@/lib/rbac';

export type NavItem = {
  href: string;
  label: string;
  icon?: 'sales' | 'accounting' | 'operations' | 'insights' | 'settings' | 'help' | 'accountCenter' | 'upload';
  roles?: UserRole[];
  modules?: AppModule[];
};

// Main navigation (top)
export const navMainItems: readonly NavItem[] = [
  { href: '/sales', label: 'Sales', icon: 'sales', roles: ['owner', 'manager', 'cashier', 'staff', 'accounts'], modules: ['sales'] },
  { href: '/buyers', label: 'Procurement', icon: 'operations', roles: ['owner', 'manager', 'buyer'], modules: ['procurement'] },
  { href: '/accounting', label: 'Accounting', icon: 'accounting', roles: ['owner', 'manager', 'accounts'], modules: ['accounting'] },
  { href: '/operations', label: 'Operations', icon: 'operations', roles: ['owner', 'manager', 'buyer'], modules: ['operations'] },
  { href: '/insights', label: 'Insights', icon: 'insights', roles: ['owner', 'manager'], modules: ['insights'] },
];

// Bottom navigation (footer)
export const navBottomItems: readonly NavItem[] = [
  // Settings is controlled by the 'settings' module when enabled by manager/owner.
  { href: '/settings', label: 'Settings', icon: 'settings', roles: ['owner', 'manager'], modules: ['settings'] },
  { href: '/help', label: 'Help', icon: 'help' },
  { href: '/import-station', label: 'Import Center', icon: 'upload', roles: ['owner', 'manager'], modules: ['operations'] },
  { href: '/account-center', label: 'Account Center', icon: 'accountCenter' },
];

// Optional unified list used by other nav UIs
export const NAV: readonly NavItem[] = [...navMainItems, ...navBottomItems];
