// app/(auth)/login/LoginClient.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginClient({ next }: { next: string }) {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Replace prevents history back into login loop
      router.replace(next || "/boot");
    } catch (err: any) {
      setError(err?.message || "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl items-stretch gap-4 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="kx-panel p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={84} height={84} priority className="rounded-2xl" />
            <div>
              <div className="text-xl font-semibold tracking-tight">Kryvexis OS</div>
              <div className="text-sm kx-muted">Minimal. Powerful. Business-ready.</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="kx-chip">📊 Dashboard command center</div>
            <div className="kx-chip">🧾 Quotes → invoices in one flow</div>
            <div className="kx-chip">💰 Payments + accounts visibility</div>
            <div className="kx-chip">🖨️ Print + PDF automation</div>
          </div>

          <div className="mt-8 rounded-2xl bg-[rgba(var(--kx-fg),.06)] p-4">
            <div className="text-xs kx-muted2">Need help?</div>
            <div className="mt-2 space-y-1 text-sm">
              <a className="underline-offset-2 hover:underline" href="mailto:kryvexissolutions@gmail.com">
                kryvexissolutions@gmail.com
              </a>
              <a className="underline-offset-2 hover:underline" href="https://wa.me/27686282874" target="_blank" rel="noreferrer">
                WhatsApp +27 68 628 2874
              </a>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="kx-card p-6 lg:p-8">
          <div className="text-xl font-semibold tracking-tight">Welcome back</div>
          <div className="mt-1 text-sm kx-muted">Sign in to your workspace.</div>

          {error ? (
            <div className="mt-4 rounded-2xl bg-[rgba(255,0,80,.10)] px-4 py-3 text-sm text-[rgb(var(--kx-fg))]">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <div className="mb-1 text-sm font-medium">Email</div>
              <input
                className="kx-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                inputMode="email"
                required
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium">Password</div>
              <div className="flex gap-2">
                <input
                  className="kx-input flex-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="kx-btn" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <button className="kx-btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link className="underline-offset-2 hover:underline" href="/forgot-password">
                Forgot password?
              </Link>
              <span className="kx-muted">
                New?{' '}
                <Link className="underline-offset-2 hover:underline" href="/signup">
                  Create account
                </Link>
              </span>
            </div>

            <div className="pt-2 text-xs kx-muted2">By signing in, you agree to Kryvexis terms.</div>
          </form>
        </div>
      </div>
    </div>
  );
}