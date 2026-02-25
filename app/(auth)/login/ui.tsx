'use client'

import Image from 'next/image'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginUI() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function signIn() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else window.location.href = '/dashboard'
  }

  async function magicLink() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' },
    })
    setLoading(false)
    if (error) setError(error.message)
    else setError('Magic link sent. Check your inbox.')
  }

  return (
    <div className="min-h-[calc(100vh-2rem)] flex items-center justify-center py-10">
      <div className="w-full max-w-md kx-surface rounded-3xl border kx-hairline p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl overflow-hidden kx-surface flex items-center justify-center">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={56} height={56} className="h-10 w-10 object-contain" priority />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">Kryvexis OS</div>
            <div className="text-xs kx-muted2">Sign in to manage clients, quotes, invoices and payments.</div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block">
            <div className="text-xs kx-muted mb-1">Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="kx-input w-full" placeholder="you@company.com" />
          </label>
          <label className="block">
            <div className="text-xs kx-muted mb-1">Password</div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="kx-input w-full" placeholder="••••••••" />
          </label>
          {error && <div className="text-xs text-red-300 bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">{error}</div>}

          <button disabled={loading} onClick={signIn} className="kx-btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button disabled={loading || !email} onClick={magicLink} className="kx-btn w-full">
            Send magic link
          </button>

          <div className="text-xs text-[rgba(var(--kx-fg),.92)]/45">
            Tip: create an account in Supabase Auth, or enable email/password and sign in.
          </div>
        </div>
      </div>
    </div>
  )
}
