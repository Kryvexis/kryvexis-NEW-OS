import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/card";
import { requireCompanyId } from "@/lib/kx";

export const dynamic = "force-dynamic";

export default async function AccountCenterPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let companyId: string | null = null;
  try {
    companyId = await requireCompanyId();
  } catch {
    companyId = null;
  }

  const { data: company } = companyId
    ? await supabase.from("companies").select("id,name,email,phone,address,logo_url,created_at").eq("id", companyId).maybeSingle()
    : { data: null };

  async function signOut() {
    "use server";
    const s = await createClient();
    await s.auth.signOut();
  }

  async function deleteAccount() {
    "use server";
    const s = await createClient();
    const { data: u } = await s.auth.getUser();
    const uid = u.user?.id;
    if (!uid) throw new Error("Not signed in");

    let cid: string | null = null;
    try {
      cid = await requireCompanyId();
    } catch {
      cid = null;
    }

    // Best-effort workspace wipe (safe even if some tables don't exist)
    if (cid) {
      const tables = [
        "invoice_items",
        "quote_items",
        "payments",
        "transactions",
        "invoices",
        "quotes",
        "products",
        "suppliers",
        "clients",
      ];

      for (const t of tables) {
        try {
          await s.from(t as any).delete().eq("company_id", cid);
        } catch {
          // ignore
        }
      }

      try {
        await s.from("companies").delete().eq("id", cid);
      } catch {
        // ignore
      }
    }

    // Optional: delete auth user if service role key is available.
    // This will only work if SUPABASE_SERVICE_ROLE_KEY exists (no params changed).
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (url && service) {
        const { createClient: createAdminClient } = await import("@supabase/supabase-js");
        const admin = createAdminClient(url, service, { auth: { persistSession: false } });
        // @ts-ignore
        await admin.auth.admin.deleteUser(uid);
      }
    } catch {
      // ignore
    }

    await s.auth.signOut();
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Account Center</div>
        <div className="text-sm text-white/60">Profile, workspace, billing, and support — all in one place.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold">Profile</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="text-white/60">Email</div>
            <div>{user?.email || "—"}</div>
            <div className="text-white/60">User ID</div>
            <div className="text-xs text-white/70 break-all">{user?.id || "—"}</div>
            <div className="text-white/60">Last sign in</div>
            <div className="text-white/70">{(user as any)?.last_sign_in_at ? String((user as any).last_sign_in_at).slice(0, 19).replace('T',' ') : "—"}</div>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="text-white/60">Company</div>
            <div>{company?.name || "—"}</div>
            <div className="text-white/60">Workspace ID</div>
            <div className="text-xs text-white/70 break-all">{company?.id || "—"}</div>
            <div className="text-white/60">Email</div>
            <div>{company?.email || "—"}</div>
            <div className="text-white/60">Phone</div>
            <div>{company?.phone || "—"}</div>
            <div className="text-white/60">Address</div>
            <div>{company?.address || "—"}</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold">Billing</div>
        <div className="mt-2 text-sm text-white/70">Billing is coming soon (Stripe + PayFast hybrid billing planned).</div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
          Current mode: manual payments (EFT + cash). Next: automated subscription billing.
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Support</div>
        <div className="mt-2 text-sm text-white/70">Need assistance? Contact Kryvexis Support.</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="text-white/60">Email</div>
          <div>
            <a className="underline underline-offset-4 decoration-white/20 hover:decoration-white/40" href="mailto:kryvexissolutions@gmail.com">
              kryvexissolutions@gmail.com
            </a>
          </div>
          <div className="text-white/60">WhatsApp</div>
          <div>
            <a className="underline underline-offset-4 decoration-white/20 hover:decoration-white/40" href="https://wa.me/27686282874" target="_blank" rel="noreferrer">
              +27 68 628 2874
            </a>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold">Session</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <form action={signOut}>
              <button className="kx-button" type="submit">Logout</button>
            </form>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold text-rose-200">Danger Zone</div>
          <div className="mt-2 text-sm text-white/70">
            This will permanently delete your workspace data (clients, products, suppliers, quotes, invoices, payments) and sign you out.
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <form action={deleteAccount}>
              <button className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/15" type="submit">
                Delete account
              </button>
            </form>
          </div>
          <div className="mt-2 text-xs text-white/50">
            Tip: If you want your login removed from authentication too, set <span className="text-white/70">SUPABASE_SERVICE_ROLE_KEY</span> in your env.
          </div>
        </Card>
      </div>
    </div>
  );
}
