import { getAccessContext } from '@/lib/rbac'
import type { UserRole } from '@/lib/roles/shared'

export async function getCurrentUserRole(): Promise<UserRole> {
  const ctx = await getAccessContext()
  return ctx.role
}
