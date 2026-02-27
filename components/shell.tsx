'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Settings, UserRound } from 'lucide-react'

import CommandPalette from './command-palette'
import LogoutButton from './logout-button'
import MobileNav from './nav/MobileNav'
import ThemeToggle from './ThemeToggle'
import { navMainItems } from './nav'

/* -----------------------------
   Top Tabs Navigation
------------------------------ */
function TopTabs() {
  const pathname = usePathname()

  return (
    <nav className="kx-topTabs" aria-label="Primary">
      {navMainItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        const IconComp = item.icon

        return (
          <Link key={item.href} href={item.href} className={active ? 'kx-topTab is-active' : 'kx-topTab'}>
            <span className="kx-topTabIcon" aria-hidden="true">
              <IconComp size={14} />
            </span>
            <span className="kx-topTabText">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/* -----------------------------
   Main Shell Layout
------------------------------ */
export default function Shell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  return (
    <div className="kx-shellV2">
      <CommandPalette />

      {/* ---------------- MOBILE HEADER ---------------- */}
      <div className="kx-mobileHeader md:hidden">
        <MobileNav userEmail={userEmail} />

        <div className="kx-mobileBrand">
          <Image src="/kryvexis-logo.png" alt="Kryvexis" width={34} height={34} className="kx-brandLogo" />
          <div className="kx-brandText">
            <div className="kx-brandName">Kryvexis</div>
            <div className="kx-brandSub">OS</div>
          </div>
        </div>

        <div className="kx-mobileRight">
          <ThemeToggle />
        </div>
      </div>

      {/* ---------------- DESKTOP HEADER ---------------- */}
      <header className="kx-headerV2 hidden md:block" role="banner">
        <div className="kx-headerInner">
          {/* Brand */}
          <div className="kx-brand">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={42} height={42} className="kx-brandLogo" priority />
            <div className="kx-brandText">
              <div className="kx-brandName">Kryvexis</div>
              <div className="kx-brandSub">OS</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="kx-tabsWrap">
            <TopTabs />
          </div>

          {/* Right Actions */}
          <div className="kx-headerRight">
            <ThemeToggle />

            <button className="kx-iconPill" type="button" aria-label="Settings">
              <Settings size={16} />
            </button>

            <button className="kx-iconPill" type="button" aria-label="Notifications">
              <Bell size={16} />
            </button>

            <button className="kx-userPill" type="button" aria-label="User">
              <UserRound size={16} />
              <span className="kx-userEmail" title={userEmail}>
                {userEmail}
              </span>
            </button>

            <LogoutButton />
          </div>
        </div>
      </header>

      {/* ---------------- PAGE CONTENT ---------------- */}
      <main className="kx-mainV2">
        <div className="kx-pageWrap">{children}</div>
      </main>
    </div>
  )
}