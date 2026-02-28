"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordClient() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl items-stretch gap-4 lg:grid-cols-2">
        <div className="kx-panel p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={84} height={84} priority className="rounded-2xl" />
            <div>
              <div className="text-xl font-semibold tracking-tight">Kryvexis OS</div>
              <div className="text-sm kx-muted">Password reset</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="kx-chip">We’ll email you a reset link</div>
            <div className="kx-chip">Check spam/junk if you don’t see it</div>
          </div>

          <div className="mt-8 rounded-2xl bg-[rgba(var(--kx-fg),.06)] p-4">
            <div className="text-xs kx-muted2">Need help?</div>
            <div className="mt-2 text-sm">
              <a className="underline-offset-2 hover:underline" href="https://wa.me/27686282874" target="_blank" rel="noreferrer">
                WhatsApp +27 68 628 2874
              </a>
            </div>
          </div>
        </div>

        <div className="kx-card p-6 lg:p-8">
          <div className="text-xl font-semibold tracking-tight">Forgot password</div>
          <div className="mt-1 text-sm kx-muted">Enter your email to reset your password.</div>

          {error ? (
            <div className="mt-4 rounded-2xl bg-[rgba(255,0,80,.10)] px-4 py-3 text-sm text-[rgb(var(--kx-fg))]">
              {error}
            </div>
          ) : null}

          {sent ? (
            <div className="mt-4 rounded-2xl bg-[rgba(34,211,238,.12)] px-4 py-3 text-sm text-[rgb(var(--kx-fg))]">
              Reset email sent. Please check your inbox.
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

            <button className="kx-btn-primary w-full" type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <div className="text-sm">
              <Link className="underline-offset-2 hover:underline" href="/login">
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
