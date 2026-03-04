export type UserRole = 'owner' | 'manager' | 'cashier' | 'buyer' | 'accounts' | 'staff'
export type AppModule = 'sales' | 'procurement' | 'accounting' | 'operations' | 'insights'

const ALL_MODULES: AppModule[] = ['sales', 'procurement', 'accounting', 'operations', 'insights']

const DEFAULT_MODULES_BY_ROLE: Record<UserRole, AppModule[]> = {
  owner: ALL_MODULES,
  manager: ALL_MODULES,
  cashier: ['sales'],
  buyer: ['procurement'],
  accounts: ['accounting'],
  staff: ['sales'],
}

export function normalizeRole(role: any): UserRole {
  const r = String(role || 'staff').toLowerCase()
  if (r === 'owner') return 'owner'
  if (r === 'manager') return 'manager'
  if (r === 'cashier') return 'cashier'
  if (r === 'buyer') return 'buyer'
  if (r === 'accounts') return 'accounts'
  return 'staff'
}

export function roleLabel(role: UserRole) {
  switch (role) {
    case 'owner':
      return 'Owner'
    case 'manager':
      return 'Manager'
    case 'cashier':
      return 'Cashier'
    case 'buyer':
      return 'Buyer'
    case 'accounts':
      return 'Accounts'
    default:
      return 'Staff'
  }
}

export function canManageUsers(role: UserRole) {
  return role === 'owner' || role === 'manager'
}

export function getDefaultModulesForRole(role: UserRole): AppModule[] {
  return [...DEFAULT_MODULES_BY_ROLE[role]]
}

export function resolveEnabledModules(
  role: UserRole,
  rows?: Array<{ module: string; enabled: boolean }> | null
): AppModule[] {
  if (role === 'owner' || role === 'manager') return [...ALL_MODULES]
  const defaults = new Set(getDefaultModulesForRole(role))
  for (const row of rows || []) {
    const module = String(row.module || '').toLowerCase() as AppModule
    if (!ALL_MODULES.includes(module)) continue
    if (row.enabled) defaults.add(module)
    else defaults.delete(module)
  }
  return ALL_MODULES.filter((m) => defaults.has(m))
}

export function canAccessPath(role: UserRole, pathname: string, enabledModules?: AppModule[]): boolean {
  const modules = new Set(enabledModules ?? resolveEnabledModules(role))
  const p = pathname.split('?')[0]
  const safe = ['/help', '/settings', '/account-center', '/import-station']
  if (safe.some((x) => p === x || p.startsWith(x + '/'))) return true

  if (modules.has('sales')) {
    if (p.startsWith('/sales') || p.startsWith('/clients') || p.startsWith('/quotes') || p.startsWith('/invoices') || p.startsWith('/payments')) {
      return true
    }
  }
  if (modules.has('procurement') || modules.has('operations')) {
    if (p.startsWith('/buyers') || p.startsWith('/products') || p.startsWith('/suppliers') || p.startsWith('/operations')) {
      return true
    }
  }
  if (modules.has('accounting')) {
    if (p.startsWith('/accounting')) return true
  }
  if (modules.has('insights')) {
    if (p.startsWith('/insights') || p.startsWith('/reports')) return true
  }

  return false
}
