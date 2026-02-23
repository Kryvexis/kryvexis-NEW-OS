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
    <div className="kx-auth">
      <div className="kx-auth-bg" aria-hidden="true" />
      <div className="kx-auth-shell">
        <div className="kx-auth-brand">
          <div className="kx-auth-brandCard">
            <div className="kx-auth-logoRow">
              <Image
                src="/kryvexis-logo.png"
                alt="Kryvexis"
                width={72}
                height={72}
                priority
                className="kx-auth-logo"
              />
              <div>
                <div className="kx-auth-brandName">Kryvexis OS</div>
                <div className="kx-auth-tag">Minimal. Powerful. Business-ready.</div>
              </div>
            </div>

            <div className="kx-auth-bullets">
              <div className="kx-auth-bullet">📊 Dashboard command center</div>
              <div className="kx-auth-bullet">🧾 Quotes → invoices in one flow</div>
              <div className="kx-auth-bullet">💰 Payments + accounts visibility</div>
              <div className="kx-auth-bullet">🖨️ Print + PDF automation</div>
            </div>

            <div className="kx-auth-contact">
              <div className="kx-auth-muted">Need help?</div>
              <a className="kx-auth-link" href="mailto:kryvexissolutions@gmail.com">
                kryvexissolutions@gmail.com
              </a>
              <a
                className="kx-auth-link"
                href="https://wa.me/27686282874"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp +27 68 628 2874
              </a>
            </div>
          </div>
        </div>

        <div className="kx-auth-formWrap">
          <div className="kx-auth-card">
            <div className="kx-auth-title">Welcome back</div>
            <div className="kx-auth-subtitle">Sign in to your workspace.</div>

            {error ? <div className="kx-auth-error">{error}</div> : null}

            <form onSubmit={onSubmit} className="kx-auth-form">
              <label className="kx-auth-label">
                Email
                <input
                  className="kx-auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  inputMode="email"
                  required
                />
              </label>

              <label className="kx-auth-label">
                Password
                <div className="kx-auth-pwRow">
                  <input
                    className="kx-auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="kx-auth-pwBtn"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <button className="kx-auth-primary" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>

              <div className="kx-auth-row">
                <Link className="kx-auth-link" href="/forgot-password">
                  Forgot password?
                </Link>
                <span className="kx-auth-muted">
                  New?{" "}
                  <Link className="kx-auth-link" href="/signup">
                    Create account
                  </Link>
                </span>
              </div>
            </form>
          </div>

          <div className="kx-auth-foot">By signing in, you agree to Kryvexis terms.</div>
        </div>
      </div>
    </div>
  );
}