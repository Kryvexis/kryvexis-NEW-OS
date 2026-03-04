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
  /** Optional: additional right-side content (eg: filters) */
  right?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="kx-h1">{title}</div>
        {subtitle ? <div className="kx-sub mt-1">{subtitle}</div> : null}
      </div>
      <div className="flex items-center gap-2">
        {right}
        {action}
      </div>
    </div>
  )
}
