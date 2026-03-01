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
    <div className="min-h-screen relative overflow-hidden px-4 py-10">
      {/* premium backdrop */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(45% 40% at 18% 18%, rgb(var(--kx-accent) / 0.22), transparent 62%),
             radial-gradient(55% 45% at 86% 20%, rgb(var(--kx-accent-2) / 0.18), transparent 64%),
             radial-gradient(55% 45% at 55% 88%, rgb(var(--kx-accent) / 0.10), transparent 62%),
             linear-gradient(180deg, rgb(0 0 0 / 0.10), rgb(0 0 0 / 0.60))`,
        }}
      />

      <div className="relative mx-auto grid w-full max-w-5xl items-stretch gap-4 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="kx-panel p-6 lg:p-9">
          <div className="flex items-center gap-3">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={84} height={84} priority className="rounded-2xl" />
            <div>
              <div className="text-xl font-semibold tracking-tight">Kryvexis OS</div>
              <div className="text-sm kx-muted">Minimal. Powerful. Business-ready.</div>
            </div>
          </div>

          {/* Keep it clean + premium */}
          <div className="mt-7 space-y-3">
            <div className="text-sm font-medium">Everything in one workspace</div>
            <ul className="space-y-2 text-sm kx-muted">
              <li className="flex gap-2"><span aria-hidden>•</span><span>Quotes → invoices in one flow</span></li>
              <li className="flex gap-2"><span aria-hidden>•</span><span>Payments + accounts visibility</span></li>
              <li className="flex gap-2"><span aria-hidden>•</span><span>Print + PDF automation</span></li>
            </ul>
            <div className="text-xs kx-muted2">Secure • Fast • Multi-tenant</div>
          </div>

          <div className="mt-8 rounded-2xl bg-[rgba(var(--kx-fg),.06)] p-4">
            <div className="text-xs kx-muted2">Support</div>
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
        <div className="kx-card p-6 lg:p-9">
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
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="kx-btn"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            <button className="kx-btn-primary w-full" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link className="underline-offset-2 hover:underline" href="/forgot-password">
                Forgot password?
              </Link>
              <span className="kx-muted">
                New?{" "}
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
