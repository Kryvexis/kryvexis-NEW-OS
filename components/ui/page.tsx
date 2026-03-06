import clsx from 'clsx'

export function Page({
  title,
  subtitle,
  action,
  right,
  children,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  right?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={clsx('grid gap-6', className)}>
      <PageHeader title={title} subtitle={subtitle} action={action} right={right} />
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
  right,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <div className="kx-page-hero">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] kx-muted2">Kryvexis OS</div>
          <div className="mt-2 kx-h1 break-words">{title}</div>
          {subtitle ? <div className="kx-sub mt-2 max-w-3xl">{subtitle}</div> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {right}
          {action}
        </div>
      </div>
    </div>
  )
}
