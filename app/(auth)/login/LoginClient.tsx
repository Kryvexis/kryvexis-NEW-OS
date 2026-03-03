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
    <div
      className="min-h-screen px-4 py-10"
      style={{
        background:
          'radial-gradient(1200px 700px at 10% 10%, rgba(16, 185, 129, .22) 0%, rgba(0,0,0,0) 55%), radial-gradient(900px 600px at 90% 20%, rgba(59, 130, 246, .18) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, #0b1220 0%, #07101d 55%, #050b14 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3 text-white">
          <Image
            src="/kryvexis-logo.png"
            alt="Kryvexis"
            width={48}
            height={48}
            priority
            className="h-10 w-10 object-contain"
            style={{ filter: 'drop-shadow(0 14px 28px rgba(0,0,0,.45))' }}
          />
          <div className="text-lg font-semibold tracking-tight">Kryvexis OS</div>
        </div>

        <div
          className="rounded-3xl border px-6 py-7 text-white"
          style={{
            borderColor: 'rgba(255,255,255,.10)',
            background: 'rgba(255,255,255,.06)',
            boxShadow: '0 30px 80px rgba(0,0,0,.45)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-2xl font-semibold tracking-tight">Sign in to your account</div>
          <div className="mt-1 text-sm text-white/70">Access your workspace and continue where you left off.</div>

          {error ? (
            <div className="mt-4 rounded-2xl bg-[rgba(255,0,80,.12)] px-4 py-3 text-sm text-white">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <div className="mb-1 text-sm font-medium text-white/85">Email Address</div>
              <input
                className="w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
                style={{ borderColor: 'rgba(255,255,255,.12)', background: 'rgba(0,0,0,.18)' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                autoComplete="email"
                inputMode="email"
                required
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium text-white/85">Password</div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-2xl border px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none"
                  style={{ borderColor: 'rgba(255,255,255,.12)', background: 'rgba(0,0,0,.18)' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="rounded-2xl border px-4 py-3 text-sm text-white/85 transition hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,.12)', background: 'rgba(255,255,255,.06)' }}
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <button
              className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition"
              style={{ background: 'linear-gradient(90deg, rgba(16,185,129,1) 0%, rgba(13,148,136,1) 100%)' }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link className="text-white/80 underline-offset-2 hover:underline" href="/forgot-password">
                Forgot password?
              </Link>
              <span className="text-white/70">
                New?{' '}
                <Link className="text-white/85 underline-offset-2 hover:underline" href="/signup">
                  Create account
                </Link>
              </span>
            </div>

            <div className="pt-2 text-center text-xs text-white/55">Powered by ⚡ Supabase</div>
            <div className="pt-1 text-center text-xs text-white/45">
              Support:{' '}
              <a
                className="underline underline-offset-4 decoration-white/20 hover:decoration-white/40"
                href="mailto:kryvexissolutions@gmail.com"
              >
                kryvexissolutions@gmail.com
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}