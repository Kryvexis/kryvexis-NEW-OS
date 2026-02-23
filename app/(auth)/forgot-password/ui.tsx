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
    <div className="kx-auth">
      <div className="kx-auth-shell">
        <div className="kx-auth-brand">
          <div className="kx-auth-brandCard">
            <div className="kx-auth-logoRow">
              <Image src="/kryvexis-logo.png" alt="Kryvexis" width={72} height={72} priority />
              <div>
                <div className="kx-auth-brandName">Kryvexis OS</div>
                <div className="kx-auth-tag">Password reset</div>
              </div>
            </div>
            <div className="kx-auth-bullets">
              <div className="kx-auth-bullet">We’ll email you a reset link.</div>
              <div className="kx-auth-bullet">Check spam/junk if you don’t see it.</div>
            </div>
          </div>
        </div>

        <div className="kx-auth-formWrap">
          <div className="kx-auth-card">
            <div className="kx-auth-title">Forgot password</div>
            <div className="kx-auth-subtitle">Enter your email to reset your password.</div>

            {error ? <div className="kx-auth-error">{error}</div> : null}

            {sent ? (
              <div className="kx-auth-error" style={{ background: "rgba(34,211,238,.10)", borderColor: "rgba(34,211,238,.22)" }}>
                Reset email sent. Please check your inbox.
              </div>
            ) : null}

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

              <button className="kx-auth-primary" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </button>

              <div className="kx-auth-row">
                <Link className="kx-auth-link" href="/login">
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>

          <div className="kx-auth-foot">Need help? WhatsApp +27 68 628 2874</div>
        </div>
      </div>
    </div>
  );
}
