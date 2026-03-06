"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkspaceBootstrap() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onCreate() {
    setLoading(true);
    setError(null);
    try {
      // Use the server bootstrap endpoint so workspace creation and
      // active-company cookie persistence happen in one flow.
      const res = await fetch("/api/company/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: "Kryvexis Workspace" }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to bootstrap workspace");

      router.refresh();
      window.location.reload();
    } catch (e: any) {
      setError(e?.message || "Failed to bootstrap workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-black/10 bg-black/5 p-4">
      <div className="text-sm font-semibold">No workspace detected</div>
      <div className="mt-1 text-sm text-black/60">
        Create and link your first workspace so your account can access POS, invoices, inventory and reports.
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onCreate}
          disabled={loading}
          className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create / Link Workspace"}
        </button>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
      </div>
    </div>
  );
}
