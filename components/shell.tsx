'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import CommandPalette from './command-palette'
import LogoutButton from './logout-button'
import MobileNav from './nav/MobileNav'
import ThemeToggle from './theme/ThemeToggle'
import { navMainItems, NavIcon } from './nav'

function GearIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M19.4 15a8 8 0 0 0 .1-1 8 8 0 0 0-.1-1l2-1.6a.6.6 0 0 0 .14-.76l-1.9-3.3a.6.6 0 0 0-.72-.26l-2.35.95a7.8 7.8 0 0 0-1.73-1l-.35-2.5A.6.6 0 0 0 14.9 2h-3.8a.6.6 0 0 0-.59.5l-.35 2.5c-.6.26-1.18.6-1.72 1l-2.36-.95a.6.6 0 0 0-.72.26L3.46 10a.6.6 0 0 0 .14.76l2 1.6a8 8 0 0 0-.1 1c0 .34.03.67.1 1l-2 1.6a.6.6 0 0 0-.14.76l1.9 3.3c.15.27.47.38.72.26l2.35-.95c.54.4 1.12.74 1.73 1l.35 2.5c.04.29.3.5.59.5h3.8c.3 0 .55-.21.59-.5l.35-2.5c.61-.26 1.19-.6 1.72-1l2.36.95c.25.12.57 0 .72-.26l1.9-3.3a.6.6 0 0 0-.14-.76l-2-1.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BellIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 22Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 1.5h15L18 16Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a4.2 4.2 0 1 0 0-8.4A4.2 4.2 0 0 0 12 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M20 21a8 8 0 0 0-16 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TopTabs() {
  const pathname = usePathname()
  return (
    <nav className="kx-topTabs" aria-label="Primary">
      {navMainItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link key={item.href} href={item.href} className={active ? 'kx-topTab is-active' : 'kx-topTab'}>
            <span className="kx-topTabIcon" aria-hidden="true">
              <NavIcon name={item.icon} />
            </span>
            <span className="kx-topTabText">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default function Shell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  return (
    <div className="kx-shellV2">
      <CommandPalette />

      {/* Mobile */}
      <div className="kx-mobileHeader md:hidden">
        <MobileNav userEmail={userEmail} />
        <div className="kx-mobileBrand">
          <Image src="/kryvexis-logo.png" alt="Kryvexis" width={34} height={34} className="kx-brandLogo" priority />
          <div className="kx-brandText">
            <div className="kx-brandName">Kryvexis</div>
            <div className="kx-brandSub">OS</div>
          </div>
        </div>
        <div className="kx-mobileRight">
          <ThemeToggle />
        </div>
      </div>

      {/* Desktop */}
      <header className="kx-headerV2 hidden md:block" role="banner">
        <div className="kx-headerInner">
          <div className="kx-brand">
            <Image src="/kryvexis-logo.png" alt="Kryvexis" width={42} height={42} className="kx-brandLogo" priority />
            <div className="kx-brandText">
              <div className="kx-brandName">Kryvexis</div>
              <div className="kx-brandSub">OS</div>
            </div>
          </div>

          <div className="kx-tabsWrap">
            <TopTabs />
          </div>

          <div className="kx-headerRight">
            <ThemeToggle />
            <button className="kx-iconPill" type="button" aria-label="Settings">
              <GearIcon />
            </button>
            <button className="kx-iconPill" type="button" aria-label="Notifications">
              <BellIcon />
            </button>
            <button className="kx-userPill" type="button" aria-label="User">
              <UserIcon />
              <span className="kx-userEmail" title={userEmail}>
                {userEmail}
              </span>
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="kx-mainV2">
        <div className="kx-pageWrap">{children}</div>
      </main>
    </div>
  )
}
