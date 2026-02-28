import { redirect } from 'next/navigation'

export default function DashboardRedirect() {
  // Dashboard is now part of Sales → Overview
  redirect('/sales/overview')
}
