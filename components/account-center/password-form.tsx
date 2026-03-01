"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

export function PasswordForm() {
  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setToast(null);

    if (pw1.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pw1 !== pw2) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setPw1("");
      setPw2("");
      setToast("Password updated ✓");
      setTimeout(() => setToast(null), 2600);
    } catch (e: any) {
      setError(e?.message || "Could not update password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      {toast ? (
        <div className="pointer-events-none absolute -top-2 right-0 z-10">
          <div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-white/85 shadow-[0_20px_60px_rgba(0,0,0,.35)] backdrop-blur-md">
            {toast}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-2xl bg-[rgba(255,0,80,.10)] px-4 py-3 text-sm text-[rgb(var(--kx-fg))]">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSave} className="mt-4 grid grid-cols-1 gap-3">
        <label className="block">
          <div className="text-xs kx-muted mb-1">New password</div>
          <input className="kx-input" type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
        </label>

        <label className="block">
          <div className="text-xs kx-muted mb-1">Confirm password</div>
          <input className="kx-input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
        </label>

        <div className="pt-1">
          <button className="kx-button kx-button-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Update password"}
          </button>
        </div>

        <div className="text-[11px] kx-muted2">Tip: If you forget your password, use “Forgot password” on the login screen.</div>
      </form>
    </div>
  );
}
