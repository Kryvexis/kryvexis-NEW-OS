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
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      router.replace("/boot");
    } catch (err: any) {
      setError(err?.message || "Could not create account.");
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
              <div className="text-sm kx-muted">Create your workspace in minutes.</div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="kx-chip">✅ Secure Supabase login</div>
            <div className="kx-chip">✅ Works on mobile + desktop</div>
            <div className="kx-chip">✅ Help center built in</div>
          </div>

          <div className="mt-8 rounded-2xl bg-[rgba(var(--kx-fg),.06)] p-4">
            <div className="text-xs kx-muted2">Need help?</div>
            <div className="mt-2 text-sm">
              <a className="underline-offset-2 hover:underline" href="mailto:kryvexissolutions@gmail.com">
                kryvexissolutions@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="kx-card p-6 lg:p-8">
          <div className="text-xl font-semibold tracking-tight">Create account</div>
          <div className="mt-1 text-sm kx-muted">You’ll be able to sign in right after.</div>

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
              <input
                className="kx-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium">Confirm password</div>
              <input
                className="kx-input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>

            <button className="kx-btn-primary w-full" type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <span className="kx-muted">
                Already have an account?{" "}
                <Link className="underline-offset-2 hover:underline" href="/login">
                  Sign in
                </Link>
              </span>
              <Link className="underline-offset-2 hover:underline" href="/demo">
                View demo
              </Link>
            </div>

            <div className="pt-2 text-xs kx-muted2">Need help? Email kryvexissolutions@gmail.com</div>
          </form>
        </div>
      </div>
    </div>
  );
}
