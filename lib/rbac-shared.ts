import type { UserRole } from '@/lib/roles/shared'

export const MODULES = ['sales', 'procurement', 'accounting', 'operations', 'insights', 'settings'] as const
export type AppModule = (typeof MODULES)[number]

export function moduleForPath(pathname: string): AppModule | null {
  const p = pathname.split('?')[0]
  if (p.startsWith('/sales') || p.startsWith('/clients') || p.startsWith('/quotes') || p.startsWith('/invoices') || p.startsWith('/payments')) return 'sales'
  if (p.startsWith('/buyers') || p.startsWith('/suppliers')) return 'procurement'
  if (p.startsWith('/accounting') || p.startsWith('/reports')) return 'accounting'
  if (p.startsWith('/operations') || p.startsWith('/products') || p.startsWith('/import-station')) return 'operations'
  if (p.startsWith('/insights')) return 'insights'
  if (p.startsWith('/settings') || p.startsWith('/help') || p.startsWith('/account-center')) return 'settings'
  return null
}

export function landingForRole(role: UserRole, isMobile: boolean) {
  if (role === 'cashier' || role === 'staff') return isMobile ? '/m/home' : '/sales/pos'
  if (role === 'buyer') return isMobile ? '/m/buyers' : '/buyers'
  if (role === 'accounts') return isMobile ? '/m/transactions' : '/accounting/dashboard'
  return isMobile ? '/m/home' : '/sales/overview'
}
