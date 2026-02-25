import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-kx flex items-center justify-center p-6">
      <div className="kx-card max-w-xl w-full text-center">
        <div className="mx-auto h-14 w-14 rounded-3xl bg-[rgba(var(--kx-border),.10)] border border-[rgba(var(--kx-border),.24)] flex items-center justify-center">
          <span className="text-2xl">🔎</span>
        </div>
        <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
        <p className="mt-1 text-sm kx-muted">The page you’re looking for doesn’t exist, or you may not have access.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link className="kx-btn" href="/dashboard">Dashboard</Link>
          <Link className="kx-btn kx-btn-ghost" href="/clients">Clients</Link>
        </div>
      </div>
    </div>
  )
}
