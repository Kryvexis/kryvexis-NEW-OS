import type React from 'react'
import clsx from 'clsx'

export function EmptyState({
  title,
  subtitle,
  action,
  className,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={clsx(
        'rounded-3xl p-6 md:p-7',
        'bg-[rgba(var(--kx-fg),.045)]',
        className,
      )}
    >
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      {subtitle ? <div className="mt-1 text-sm kx-muted">{subtitle}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
