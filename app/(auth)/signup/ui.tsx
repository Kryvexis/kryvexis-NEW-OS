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
    <div className="kx-auth">
      <div className="kx-auth-shell">
        <div className="kx-auth-brand">
          <div className="kx-auth-brandCard">
            <div className="kx-auth-logoRow">
              <Image src="/kryvexis-logo.png" alt="Kryvexis" width={72} height={72} priority />
              <div>
                <div className="kx-auth-brandName">Kryvexis OS</div>
                <div className="kx-auth-tag">Create your workspace in minutes.</div>
              </div>
            </div>
            <div className="kx-auth-bullets">
              <div className="kx-auth-bullet">✅ Secure Supabase login</div>
              <div className="kx-auth-bullet">✅ Works on mobile + desktop</div>
              <div className="kx-auth-bullet">✅ Help center built in</div>
            </div>
          </div>
        </div>

        <div className="kx-auth-formWrap">
          <div className="kx-auth-card">
            <div className="kx-auth-title">Create account</div>
            <div className="kx-auth-subtitle">You’ll be able to sign in right after.</div>

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
                <input
                  className="kx-auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="kx-auth-label">
                Confirm password
                <input
                  className="kx-auth-input"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </label>

              <button className="kx-auth-primary" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create account"}
              </button>

              <div className="kx-auth-row">
                <span className="kx-auth-muted">
                  Already have an account?{" "}
                  <Link className="kx-auth-link" href="/login">
                    Sign in
                  </Link>
                </span>
                <Link className="kx-auth-link" href="/demo">
                  View demo
                </Link>
              </div>
            </form>
          </div>

          <div className="kx-auth-foot">Need help? Email kryvexissolutions@gmail.com</div>
        </div>
      </div>
    </div>
  );
}
