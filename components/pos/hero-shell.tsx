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
      <div className="kx-card overflow-hidden">
        <div
          className="relative p-6"
          style={{
            background:
              'radial-gradient(900px 420px at 16% -10%, rgb(var(--kx-accent) / 0.24), transparent 60%), radial-gradient(900px 420px at 86% -12%, rgb(var(--kx-accent-2) / 0.22), transparent 62%), linear-gradient(180deg, rgb(255 255 255 / 0.03), transparent 52%)',
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <div className="text-2xl font-semibold tracking-tight">{title}</div>
              {subtitle ? <div className="mt-1 text-sm kx-muted">{subtitle}</div> : null}
              {meta ? <div className="mt-4">{meta}</div> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-4">{children}</div>
        {rail ? <div className="space-y-4">{rail}</div> : null}
      </div>
    </div>
  )
}
