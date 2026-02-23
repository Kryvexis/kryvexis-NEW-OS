import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HelpCenterButton from "@/components/help/HelpCenterButton";
import Onboarding from "@/components/onboarding/Onboarding";
import MobileNav from "@/components/nav/MobileNav";

export default function Shell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 border-r border-white/10 bg-white/5">
          <div className="w-full p-4 space-y-4">
            <div className="text-sm font-semibold text-white/90">Kryvexis OS</div>

            <nav className="space-y-1 text-sm">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/clients">Clients</NavLink>
              <NavLink href="/products">Products</NavLink>
              <NavLink href="/quotes">Quotes</NavLink>
              <NavLink href="/invoices">Invoices</NavLink>
              <NavLink href="/payments">Payments</NavLink>
              <NavLink href="/reports">Reports</NavLink>
              <NavLink href="/settings">Settings</NavLink>
              <NavLink href="/help">Help</NavLink>
            </nav>

            <div className="pt-4 border-t border-white/10 text-xs text-white/60">
              Signed in as
              <div className="text-white/85 break-all">{userEmail}</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-10 border-b border-white/10 bg-[#070A12]/70 backdrop-blur">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MobileNav />
                <div className="text-sm text-white/80">Kryvexis OS</div>
              </div>

              <div className="flex items-center gap-2">
                <Onboarding />
                <HelpCenterButton />

                <form action={signOut}>
                  <button className="kx-button" type="submit">
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-transparent px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white transition"
    >
      {children}
    </Link>
  );
}