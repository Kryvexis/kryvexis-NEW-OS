import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/card";
import { getCompanyIdOrNull } from "@/lib/kx";
import WorkspaceBootstrap from "./workspace-bootstrap";

export const dynamic = "force-dynamic";

export default async function AccountCenterPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  let companyId: string | null = null;
  companyId = await getCompanyIdOrNull();

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
    cid = await getCompanyIdOrNull();

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
        <div className="text-sm kx-muted">Profile, workspace, billing, and support — all in one place.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold">Profile</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="kx-muted">Email</div>
            <div>{user?.email || "—"}</div>
            <div className="kx-muted">User ID</div>
            <div className="text-xs kx-muted break-all">{user?.id || "—"}</div>
            <div className="kx-muted">Last sign in</div>
            <div className="kx-muted">{(user as any)?.last_sign_in_at ? String((user as any).last_sign_in_at).slice(0, 19).replace('T',' ') : "—"}</div>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Workspace</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="kx-muted">Company</div>
            <div>{company?.name || "—"}</div>
            <div className="kx-muted">Workspace ID</div>
            <div className="text-xs kx-muted break-all">{company?.id || "—"}</div>
            <div className="kx-muted">Email</div>
            <div>{company?.email || "—"}</div>
            <div className="kx-muted">Phone</div>
            <div>{company?.phone || "—"}</div>
            <div className="kx-muted">Address</div>
            <div>{company?.address || "—"}</div>
          </div>

          {!companyId ? <WorkspaceBootstrap /> : null}
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold">Billing</div>
        <div className="mt-2 text-sm kx-muted">Billing is coming soon (Stripe + PayFast hybrid billing planned).</div>
        <div className="mt-3 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-3 text-xs kx-muted">
          Current mode: manual payments (EFT + cash). Next: automated subscription billing.
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold">Security</div>
          <div className="mt-2 text-sm kx-muted">
            Password & security controls.
          </div>
          <div className="mt-3 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-3 text-xs kx-muted">
            Change password and enable extra security checks (coming soon).
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Team & Roles</div>
          <div className="mt-2 text-sm kx-muted">
            Invite staff, assign roles (staff / accounts / manager).
          </div>
          <div className="mt-3 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-3 text-xs kx-muted">
            Next: manage users, permissions, and activity log.
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold">Preferences</div>
        <div className="mt-2 text-sm kx-muted">Notifications and workflow preferences.</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="kx-muted">Notifications</div>
          <div className="kx-muted">Coming soon (invoice reminders, payments, stock alerts).</div>
          <div className="kx-muted">Default currency</div>
          <div className="kx-muted">Coming soon</div>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Support</div>
        <div className="mt-2 text-sm kx-muted">Need assistance? Contact Kryvexis Support.</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="kx-muted">Email</div>
          <div>
            <a className="underline underline-offset-4 decoration-white/20 hover:decoration-white/40" href="mailto:kryvexissolutions@gmail.com">
              kryvexissolutions@gmail.com
            </a>
          </div>
          <div className="kx-muted">WhatsApp</div>
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
          <div className="mt-2 text-sm kx-muted">
            This will permanently delete your workspace data (clients, products, suppliers, quotes, invoices, payments) and sign you out.
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <form action={deleteAccount}>
              <button className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/15" type="submit">
                Delete account
              </button>
            </form>
          </div>
          <div className="mt-2 text-xs text-[rgba(var(--kx-fg),.92)]/50">
            Tip: If you want your login removed from authentication too, set <span className="kx-muted">SUPABASE_SERVICE_ROLE_KEY</span> in your env.
          </div>
        </Card>
      </div>
    </div>
  );
}
