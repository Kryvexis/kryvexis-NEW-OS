import Image from 'next/image'
import MobileNav from "@/components/nav/MobileNav";
import { Sidebar } from '@/components/nav'
import ThemeToggle from '@/components/theme/ThemeToggle'

export default function Shell({
  children,
  userEmail,
  workspaceName,
  memberType,
}: {
  children: React.ReactNode;
  userEmail: string;
  workspaceName?: string;
  memberType?: string;
}) {
  return (
    <div className="min-h-screen text-white">
      <div className="flex min-h-screen">
        {/* Sidebar (desktop) */}
        <Sidebar userEmail={userEmail} workspaceName={workspaceName} memberType={memberType} />

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-10 border-b border-white/10 backdrop-blur" style={{ background: 'rgba(var(--kx-shell), .72)' }}>
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MobileNav />
                <div className="flex items-center gap-2">
                  <div className="md:hidden overflow-hidden" style={{ filter: 'drop-shadow(0 0 14px rgba(var(--kx-accent), .22))' }}>
                    <Image src="/kryvexis-logo.png" alt="Kryvexis" width={52} height={52} className="h-[52px] w-[52px] object-contain" priority />
                  </div>
                  <div className="text-sm font-semibold tracking-tight text-white/85">Kryvexis OS</div>
                </div>
              </div>

              {/* Top-right controls intentionally minimal. (Sign out is in Account Center.) */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  disabled
                  title="Notifications (coming soon)"
                  className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white/90 disabled:opacity-60 disabled:hover:bg-white/5"
                >
                  <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" stroke="currentColor" strokeWidth="1.5" opacity="0.9"/>
                    <path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="currentColor" strokeWidth="1.5" opacity="0.6" strokeLinecap="round"/>
                  </svg>
                </button>
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