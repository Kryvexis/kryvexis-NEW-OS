import { Card } from '@/components/card'

export type TimelineEvent = {
  id: string
  title: string
  meta?: string
  kind?: 'good' | 'warn' | 'info'
  at?: string
}

function dot(kind?: string) {
  if (kind === 'good') return 'bg-emerald-400/90'
  if (kind === 'warn') return 'bg-amber-400/90'
  return 'bg-sky-400/90'
}

export function StatusTimeline({ title = 'Timeline', events }: { title?: string; events: TimelineEvent[] }) {
  return (
    <Card>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-3 space-y-3">
        {events.map((e) => (
          <div key={e.id} className="flex gap-3">
            <div className="mt-1 flex h-6 w-6 items-center justify-center">
              <span className={`h-2.5 w-2.5 rounded-full ${dot(e.kind)}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{e.title}</div>
              <div className="text-xs kx-muted">
                {[e.meta, e.at].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
        ))}
        {!events.length ? <div className="text-sm kx-muted">No activity yet.</div> : null}
      </div>
    </Card>
  )
}
