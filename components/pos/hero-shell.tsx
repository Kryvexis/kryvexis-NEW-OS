import type React from 'react'
import clsx from 'clsx'

export function PosHeroShell({
  title,
  subtitle,
  meta,
  actions,
  children,
  rail,
  className,
}: {
  title: string
  subtitle?: string
  meta?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  rail?: React.ReactNode
  className?: string
}) {
  return (
    <div className={clsx('space-y-4', className)}>
      {/* Slim header (clean + minimal, like the reference UI) */}
      <div className="kx-card">
        <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="text-xl font-semibold tracking-tight">{title}</div>
            {subtitle ? <div className="mt-1 text-sm kx-muted">{subtitle}</div> : null}
            {meta ? <div className="mt-3">{meta}</div> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-4">{children}</div>
        {rail ? <div className="space-y-4">{rail}</div> : null}
      </div>
    </div>
  )
}
