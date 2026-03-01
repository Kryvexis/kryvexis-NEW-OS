import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/card'

export default function ShareShell({
  company,
  title,
  subtitle,
  children,
}: {
  company: { name?: string | null; logo_url?: string | null; email?: string | null; phone?: string | null } | null
  title: string
  subtitle?: string | null
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen kx-bg">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <div className="h-10 w-10 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10">
                <Image src={company.logo_url} alt={company?.name ?? 'Company'} width={40} height={40} className="h-10 w-10 object-cover" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10" />
            )}
            <div>
              <div className="text-sm text-white/70">{company?.name ?? 'Kryvexis Client'}</div>
              <div className="text-xs text-white/45">Secure document view</div>
            </div>
          </div>

          <Link href="/" className="kx-btn kx-btn-secondary">
            Sign in
          </Link>
        </div>

        <div className="mt-8">
          <div className="text-3xl font-semibold tracking-tight text-white">{title}</div>
          {subtitle ? <div className="mt-2 text-white/60">{subtitle}</div> : null}
        </div>

        <div className="mt-8">{children}</div>

        <div className="mt-10 text-center text-xs text-white/40">
          Powered by <span className="text-white/60">Kryvexis</span>
        </div>
      </div>
    </div>
  )
}
