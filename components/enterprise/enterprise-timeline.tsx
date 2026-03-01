'use client'

import * as React from 'react'
import { Card } from '@/components/card'
import { enterpriseStatusMap, enterpriseStatusOrder, type EnterpriseStatus } from '@/lib/statusMap'

export type EnterpriseTimelineEvent = {
  id: string
  status: EnterpriseStatus
  title?: string
  meta?: string
  at?: string
}

function lineFillClass(progress: number) {
  // subtle indigo base + fill
  if (progress >= 1) return 'bg-gradient-to-b from-indigo-400/35 via-indigo-500/25 to-indigo-400/10'
  return 'bg-indigo-500/15'
}

export function EnterpriseTimeline({ title = 'Timeline', events }: { title?: string; events: EnterpriseTimelineEvent[] }) {
  const sorted = React.useMemo(() => {
    const orderIndex = new Map(enterpriseStatusOrder.map((s, i) => [s, i]))
    return [...events].sort((a, b) => (orderIndex.get(a.status) ?? 0) - (orderIndex.get(b.status) ?? 0))
  }, [events])

  const last = sorted[sorted.length - 1]
  const lastIdx = last ? enterpriseStatusOrder.indexOf(last.status) : -1

  return (
    <Card>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-4 relative">
        {/* base line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-[2px] rounded-full bg-white/5" />
        {/* fill line */}
        <div
          className={
            'absolute left-[11px] top-0 w-[2px] rounded-full ' + lineFillClass(lastIdx >= 0 ? 1 : 0)
          }
          style={{ height: lastIdx >= 0 ? `${Math.min(100, ((lastIdx + 1) / enterpriseStatusOrder.length) * 100)}%` : '0%' }}
        />

        <div className="space-y-4">
          {enterpriseStatusOrder.map((status, idx) => {
            const cfg = enterpriseStatusMap[status]
            const ev = sorted.find((e) => e.status === status)
            const reached = idx <= lastIdx
            const isLatest = reached && idx === lastIdx

            return (
              <div key={status} className="relative flex gap-3">
                <div className="pt-0.5">
                  <span
                    className={
                      'block h-[12px] w-[12px] rounded-full ' +
                      (reached ? cfg.dotClass : 'bg-white/10') +
                      ' ' +
                      (reached ? cfg.glowClass : '') +
                      (isLatest ? ' animate-pulse' : '')
                    }
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium truncate">
                      {ev?.title || cfg.label}
                      {status === 'sent' ? <span className="ml-2 text-[11px] text-[#25D366]">WhatsApp</span> : null}
                    </div>
                    {ev?.at ? <div className="text-[11px] kx-muted whitespace-nowrap">{ev.at}</div> : null}
                  </div>
                  <div className="text-xs kx-muted mt-0.5">{ev?.meta || (!reached ? '—' : '')}</div>
                </div>
              </div>
            )
          })}

          {!events.length ? <div className="text-sm kx-muted">No activity yet.</div> : null}
        </div>
      </div>
    </Card>
  )
}
