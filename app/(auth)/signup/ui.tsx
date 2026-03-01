"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function normalizePhone(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  // ZA convenience: 0XXXXXXXXX -> 27XXXXXXXXX
  if (digits.startsWith("0")) return "27" + digits.slice(1);
  return digits;
}

export default function SignupClient() {
  const router = useRouter();
  const [companyName, setCompanyName] = React.useState("");
  const [phone, setPhone] = React.useState("");
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
        options: {
          data: {
            company_name: companyName.trim() || "My Company",
            phone: phone.trim() ? normalizePhone(phone.trim()) : null,
          },
        },
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
        <div className="kx-panel p-6 lg:p-9">
          <div className="flex items-center gap-3">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={84} height={84} priority className="rounded-2xl" />
            <div>
              <div className="text-xl font-semibold tracking-tight">Kryvexis OS</div>
              <div className="text-sm kx-muted">Create your workspace in minutes.</div>
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <div className="text-sm font-medium">Built for day-to-day ops</div>
            <ul className="space-y-2 text-sm kx-muted">
              <li className="flex gap-2"><span aria-hidden>•</span><span>Clients, quotes, invoices, payments</span></li>
              <li className="flex gap-2"><span aria-hidden>•</span><span>Share documents online + PDF printing</span></li>
              <li className="flex gap-2"><span aria-hidden>•</span><span>Works great on desktop and mobile</span></li>
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

        <div className="kx-card p-6 lg:p-9">
          <div className="text-xl font-semibold tracking-tight">Create account</div>
          <div className="mt-1 text-sm kx-muted">You’ll be able to sign in right after.</div>

          {error ? (
            <div className="mt-4 rounded-2xl bg-[rgba(255,0,80,.10)] px-4 py-3 text-sm text-[rgb(var(--kx-fg))]">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <div className="mb-1 text-sm font-medium">Business name</div>
              <input
                className="kx-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Kryvexis"
                autoComplete="organization"
              />
              <div className="mt-1 text-[11px] kx-muted2">This becomes your workspace name (you can change it later).</div>
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium">WhatsApp / Cellphone (optional)</div>
              <input
                className="kx-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27…"
                inputMode="tel"
              />
              <div className="mt-1 text-[11px] kx-muted2">Tip: use country code. Example: +27 68 628 2874.</div>
            </label>

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

            <div className="pt-2 text-xs kx-muted2">By creating an account, you agree to Kryvexis terms.</div>
          </form>
        </div>
      </div>
    </div>
  );
}
