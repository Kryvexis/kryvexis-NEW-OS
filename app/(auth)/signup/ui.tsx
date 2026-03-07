"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupClient() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      router.replace("/boot");
    } catch (err: any) {
      setError(err?.message || "Could not create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen px-4 py-10"
      style={{
        background:
          'radial-gradient(1100px 680px at 8% 8%, rgba(16,185,129,.18) 0%, rgba(0,0,0,0) 55%), radial-gradient(980px 620px at 92% 12%, rgba(59,130,246,.16) 0%, rgba(0,0,0,0) 58%), linear-gradient(180deg, #0b1220 0%, #07101d 55%, #050b14 100%)',
      }}
    >
      <div className="mx-auto grid w-full max-w-5xl items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div
          className="rounded-[28px] border px-6 py-7 text-white lg:px-8"
          style={{
            borderColor: 'rgba(255,255,255,.10)',
            background: 'rgba(255,255,255,.05)',
            boxShadow: '0 30px 80px rgba(0,0,0,.42)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <div className="flex items-center gap-3">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={84} height={84} priority className="h-14 w-14 rounded-2xl object-contain" />
            <div>
              <div className="text-2xl font-semibold tracking-tight">Kryvexis OS</div>
              <div className="text-sm text-white/70">Create your workspace in minutes.</div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-white/85 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">✅ Secure Supabase login</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">✅ Works on mobile + desktop</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">✅ Help center built in</div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-xs uppercase tracking-[0.16em] text-white/45">Need help?</div>
            <div className="mt-2 text-sm text-white/90">
              <a className="underline underline-offset-4 decoration-white/20 hover:decoration-white/40" href="mailto:kryvexissolutions@gmail.com">
                kryvexissolutions@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div
          className="rounded-[28px] border px-6 py-7 text-white lg:px-8"
          style={{
            borderColor: 'rgba(255,255,255,.10)',
            background: 'rgba(255,255,255,.06)',
            boxShadow: '0 30px 80px rgba(0,0,0,.45)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-2xl font-semibold tracking-tight">Create account</div>
          <div className="mt-1 text-sm text-white/70">You’ll be able to sign in right after.</div>

          {error ? <div className="mt-4 rounded-2xl bg-[rgba(255,0,80,.12)] px-4 py-3 text-sm text-white">{error}</div> : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <div className="mb-1 text-sm font-medium text-white/85">Email</div>
              <input className="w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none" style={{ borderColor: 'rgba(255,255,255,.12)', background: 'rgba(0,0,0,.18)' }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" inputMode="email" required />
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium text-white/85">Password</div>
              <input className="w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none" style={{ borderColor: 'rgba(255,255,255,.12)', background: 'rgba(0,0,0,.18)' }} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" type="password" autoComplete="new-password" required />
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium text-white/85">Confirm password</div>
              <input className="w-full rounded-2xl border px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none" style={{ borderColor: 'rgba(255,255,255,.12)', background: 'rgba(0,0,0,.18)' }} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" type="password" autoComplete="new-password" required />
            </label>

            <button className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition" style={{ background: 'linear-gradient(90deg, rgba(16,185,129,1) 0%, rgba(13,148,136,1) 100%)' }} type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">
                Already have an account? <Link className="text-white/85 underline-offset-2 hover:underline" href="/login">Sign in</Link>
              </span>
              <Link className="text-white/80 underline-offset-2 hover:underline" href="/demo">View demo</Link>
            </div>

            <div className="pt-2 text-xs text-white/45">Need help? Email kryvexissolutions@gmail.com</div>
          </form>
        </div>
      </div>
    </div>
  );
}
