import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/card";
import { requireCompanyId } from "@/lib/kx";

export const dynamic = "force-dynamic";

function normalizePhone(raw?: string | null) {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  // ZA convenience: 0XXXXXXXXX -> 27XXXXXXXXX
  if (digits.startsWith("0")) return "27" + digits.slice(1);
  return digits;
}

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
    ? await supabase
        .from("companies")
        .select("id,name,email,phone,address,logo_url,created_at")
        .eq("id", companyId)
        .maybeSingle()
    : { data: null };

  async function signOut() {
    "use server";
    const s = await createClient();
    await s.auth.signOut();
  }

  async function updateWorkspace(formData: FormData) {
    "use server";
    const s = await createClient();

    let cid: string | null = null;
    try {
      cid = await requireCompanyId();
    } catch {
      cid = null;
    }
    if (!cid) return;

    const name = String(formData.get("name") || "").trim();
    const phoneRaw = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();

    const phone = phoneRaw ? normalizePhone(phoneRaw) : null;

    // Best-effort update (RLS should ensure only workspace owner can update)
    await s
      .from("companies")
      .update({
        name: name || null,
        phone,
        address: address || null,
      })
      .eq("id", cid);
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
            <div className="kx-muted">
              {(user as any)?.last_sign_in_at
                ? String((user as any).last_sign_in_at).slice(0, 19).replace("T", " ")
                : "—"}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Workspace</div>
              <div className="mt-1 text-xs kx-muted">Edit your company details (used in documents + support).</div>
            </div>
          </div>

          <form action={updateWorkspace} className="mt-4 grid grid-cols-1 gap-3">
            <label className="block">
              <div className="text-xs kx-muted mb-1">Company name</div>
              <input className="kx-input" name="name" defaultValue={company?.name || ""} placeholder="Your business name" />
            </label>

            <label className="block">
              <div className="text-xs kx-muted mb-1">WhatsApp / Cellphone</div>
              <input
                className="kx-input"
                name="phone"
                defaultValue={company?.phone || ""}
                placeholder="+27…"
                inputMode="tel"
              />
              <div className="mt-1 text-[11px] kx-muted">
                Tip: use country code. Example: +27 68 628 2874.
              </div>
            </label>

            <label className="block">
              <div className="text-xs kx-muted mb-1">Address</div>
              <input className="kx-input" name="address" defaultValue={company?.address || ""} placeholder="Business address (optional)" />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm pt-1">
              <div className="kx-muted">Workspace ID</div>
              <div className="text-xs kx-muted break-all">{company?.id || "—"}</div>
              <div className="kx-muted">Workspace email</div>
              <div>{company?.email || "—"}</div>
            </div>

            <div className="pt-2">
              <button className="kx-button kx-button-primary" type="submit">
                Save workspace details
              </button>
            </div>
          </form>
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
          <div className="mt-2 text-sm kx-muted">Password & security controls.</div>
          <div className="mt-3 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-3 text-xs kx-muted">
            Change password and enable extra security checks (coming soon).
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold">Team & Roles</div>
          <div className="mt-2 text-sm kx-muted">Invite staff, assign roles (staff / accounts / manager).</div>
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
