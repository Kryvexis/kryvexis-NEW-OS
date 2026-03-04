import clsx from 'clsx'

export function Page({
  title,
  subtitle,
  action,
  right,
  search,
  children,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  right?: React.ReactNode
  search?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={clsx('grid gap-6', className)}>
      <PageHeader title={title} subtitle={subtitle} action={action} right={right} search={search} />
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
  right,
  search,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  right?: React.ReactNode
  search?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="kx-h1">{title}</div>
        {subtitle ? <div className="kx-sub mt-1">{subtitle}</div> : null}
      </div>
      <div className="flex items-center gap-2">
        {search}
        {right}
        {action}
      </div>
    </div>
  )
}
