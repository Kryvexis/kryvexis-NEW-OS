import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/card";
import { requireCompanyId } from "@/lib/kx";
import { WorkspaceForm } from "@/components/account-center/workspace-form";
import { PasswordForm } from "@/components/account-center/password-form";
import { PreferencesForm } from "@/components/account-center/preferences-form";
import { TeamManager } from "@/components/account-center/team-manager";

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
        .select("id,name,email,phone,address,logo_url,created_at,settings_json")
        .eq("id", companyId)
        .maybeSingle()
    : { data: null };

  async function signOut() {
    "use server";
    const s = await createClient();
    await s.auth.signOut();
  }

  async function updateWorkspace(prevState: any, formData: FormData) {
    "use server";
    const s = await createClient();

    let cid: string | null = null;
    try {
      cid = await requireCompanyId();
    } catch {
      cid = null;
    }
    if (!cid) return { ok: false, ts: Date.now(), message: "No workspace" };

    const name = String(formData.get("name") || "").trim();
    const phoneRaw = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();

    const digits = phoneRaw ? phoneRaw.replace(/\D/g, "") : "";
    const phone = digits ? (digits.startsWith("0") ? "27" + digits.slice(1) : digits) : null;

    await s
      .from("companies")
      .update({
        name: name || null,
        phone,
        address: address || null,
      })
      .eq("id", cid);

    return { ok: true, ts: Date.now(), message: "Saved" };
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

          <WorkspaceForm company={company} action={updateWorkspace} />
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold">Billing</div>
        <div className="mt-2 text-sm kx-muted">
          Current billing mode: <span className="text-[rgba(var(--kx-fg),.90)]">Manual payments (EFT + cash)</span>.
        </div>

        <div className="mt-3 rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-border),.06)] p-4 text-sm">
          <div className="font-medium">Payment instructions</div>
          <div className="mt-2 kx-muted">
            For now, billing is handled manually. We’ll keep your account active as long as your payment is up to date.
          </div>
          <ul className="mt-3 space-y-1 text-sm kx-muted">
            <li>• Method: EFT or cash</li>
            <li>• Reference: your company name</li>
            <li>• Support: kryvexissolutions@gmail.com</li>
          </ul>
          <div className="mt-3 text-[11px] kx-muted2">
            Next: hybrid billing (Stripe + PayFast) when you’re ready.
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-sm font-semibold">Security</div>
          <div className="mt-2 text-sm kx-muted">Update your password securely.</div>
          <PasswordForm />
        </Card>

        <Card>
          <div className="text-sm font-semibold">Team & Roles</div>
          <div className="mt-2 text-sm kx-muted">Invite staff and assign roles (owner / manager / accounts / staff).</div>
          <TeamManager />
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold">Preferences</div>
        <div className="mt-2 text-sm kx-muted">Notifications and workflow preferences.</div>
        <PreferencesForm initial={(company?.settings_json as any) || {}} />
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
