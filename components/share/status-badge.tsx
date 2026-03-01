import { statusTone } from '@/lib/status'

export function StatusBadge({ status }: { status: string }) {
  const t = statusTone(status)
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ring-1 ${t.badge}`}>
      <span className={`h-2 w-2 rounded-full ${t.dot}`} />
      {t.label}
    </span>
  )
}
