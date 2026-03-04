export type UserRole = 'owner' | 'manager' | 'cashier' | 'buyer' | 'accounts' | 'staff'

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

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (role === 'owner' || role === 'manager') return true

  const p = pathname.split('?')[0]
  const safe = ['/help', '/settings', '/account-center', '/import-station']
  if (safe.some((x) => p === x || p.startsWith(x + '/'))) return true

  if (role === 'cashier') {
    return (
      p.startsWith('/sales') ||
      p.startsWith('/clients') ||
      p.startsWith('/quotes') ||
      p.startsWith('/invoices') ||
      p.startsWith('/payments')
    )
  }

  if (role === 'buyer') {
    return p.startsWith('/buyers') || p.startsWith('/operations') || p.startsWith('/products') || p.startsWith('/suppliers')
  }

  if (role === 'accounts') {
    return p.startsWith('/accounting') || p.startsWith('/payments') || p.startsWith('/clients') || p.startsWith('/reports')
  }

  return p.startsWith('/sales') || p.startsWith('/clients')
}
