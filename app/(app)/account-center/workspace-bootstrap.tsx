"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WorkspaceBootstrap() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onCreate() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      // 1) Create (or reuse) a workspace via SECURITY DEFINER RPC (no service role key needed)
      const { data: companyId, error: rpcErr } = await supabase.rpc("bootstrap_workspace", {
        company_name: "Kryvexis Workspace",
      });

      if (rpcErr) throw new Error(rpcErr.message);
      if (!companyId) throw new Error("Failed to create workspace");

      // 2) Persist the active company cookie (server-side)
      const res = await fetch("/api/company/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to set active workspace");

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
