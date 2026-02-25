'use client'

import * as React from 'react'
import Link from 'next/link'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-kx flex items-center justify-center p-6">
      <div className="kx-card max-w-xl w-full">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[rgba(var(--kx-border),.10)] border border-[rgba(var(--kx-border),.15)] flex items-center justify-center">
            <span className="text-lg">⚠️</span>
          </div>
          <div>
            <div className="text-lg font-semibold">Something went wrong</div>
            <div className="text-sm kx-muted">A recoverable error occurred. You can try again or go back.</div>
          </div>
        </div>

        <div className="mt-4 text-sm kx-muted break-words">
          {process.env.NODE_ENV === 'development' ? error.message : 'Please try again. If this keeps happening, contact support.'}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button className="kx-btn" onClick={() => reset()}>Try again</button>
          <Link className="kx-btn kx-btn-ghost" href="/dashboard">Go to dashboard</Link>
          <Link className="kx-btn kx-btn-ghost" href="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}
