import clsx from 'clsx'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={clsx('kx-card p-5 md:p-6', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold tracking-tight">{children}</div>
}

export function CardSub({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('text-xs kx-muted', className)}>{children}</div>
}
