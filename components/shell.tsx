import Image from 'next/image'
import { createClient } from "@/lib/supabase/server";
import HelpCenterButton from "@/components/help/HelpCenterButton";
import Onboarding from "@/components/onboarding/Onboarding";
import MobileNav from "@/components/nav/MobileNav";
import { Sidebar } from '@/components/nav'

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
        {/* Sidebar (desktop) */}
        <Sidebar userEmail={userEmail} />

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-10 border-b border-white/10 bg-[#070A12]/70 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MobileNav />
                <div className="flex items-center gap-2">
                  <div className="md:hidden h-8 w-8 rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,.10)', background: 'rgba(255,255,255,.06)' }}>
                    <Image src="/kryvexis-logo.png" alt="Kryvexis" width={64} height={64} className="h-8 w-8 object-contain" priority />
                  </div>
                  <div className="text-sm font-semibold tracking-tight text-white/85">Kryvexis OS</div>
                </div>
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

          <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}