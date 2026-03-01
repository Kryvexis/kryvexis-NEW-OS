"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

type Prefs = {
  currency?: string;
  notify_invoice_reminders?: boolean;
  notify_payment_updates?: boolean;
  notify_low_stock?: boolean;
};

const CURRENCIES = [
  { code: "ZAR", label: "ZAR (South Africa)" },
  { code: "USD", label: "USD (United States)" },
  { code: "EUR", label: "EUR (Europe)" },
  { code: "GBP", label: "GBP (United Kingdom)" },
];

export function PreferencesForm({ initial }: { initial: Prefs }) {
  const [currency, setCurrency] = React.useState(initial.currency || "ZAR");
  const [invoiceReminders, setInvoiceReminders] = React.useState(!!initial.notify_invoice_reminders);
  const [paymentUpdates, setPaymentUpdates] = React.useState(!!initial.notify_payment_updates);
  const [lowStock, setLowStock] = React.useState(!!initial.notify_low_stock);

  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setToast(null);
    setSaving(true);

    try {
      const supabase = createClient();
      const { data: cid, error: cidErr } = await supabase.rpc("current_company_id");
      if (cidErr) throw cidErr;

      const settings = {
        currency,
        notify_invoice_reminders: invoiceReminders,
        notify_payment_updates: paymentUpdates,
        notify_low_stock: lowStock,
      };

      const { error } = await supabase.from("companies").update({ settings_json: settings }).eq("id", cid as any);
      if (error) throw error;

      setToast("Preferences saved ✓");
      setTimeout(() => setToast(null), 2600);
    } catch (e: any) {
      setError(e?.message || "Could not save preferences.");
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
          <div className="text-xs kx-muted mb-1">Default currency</div>
          <select className="kx-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-3">
          <div className="text-sm font-medium">Notifications</div>
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex items-center justify-between gap-3">
              <span className="kx-muted">Invoice reminders</span>
              <input type="checkbox" checked={invoiceReminders} onChange={(e) => setInvoiceReminders(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="kx-muted">Payment updates</span>
              <input type="checkbox" checked={paymentUpdates} onChange={(e) => setPaymentUpdates(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="kx-muted">Low stock alerts</span>
              <input type="checkbox" checked={lowStock} onChange={(e) => setLowStock(e.target.checked)} />
            </label>
          </div>
          <div className="mt-2 text-[11px] kx-muted2">These settings prepare the system for automated alerts.</div>
        </div>

        <div className="pt-1">
          <button className="kx-button kx-button-primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save preferences"}
          </button>
        </div>
      </form>
    </div>
  );
}
