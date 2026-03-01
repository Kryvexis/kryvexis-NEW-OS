'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { navMainItems, navBottomItems, NavIcon } from '@/components/nav'

type MobileNavProps = {
  userEmail?: string
  workspaceName?: string
  onOpenCompanySwitcher?: () => void
}

export default function MobileNav(props: MobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname() || ''

  // Close menu on route change
  React.useEffect(() => {
    setOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <button data-tour="mobile-nav" className="kx-icon-btn md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
        ☰
      </button>

      {!open ? null : (
        <div className="fixed inset-0 z-[90]">
          {/* Backdrop */}
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div
            className="absolute left-0 top-0 h-full w-[82%] max-w-[330px] border-r border-white/10 bg-[rgba(var(--kx-shell),.96)] shadow-[20px_0_90px_rgba(0,0,0,.55)]"
            style={{
              background:
                'linear-gradient(180deg, rgb(var(--kx-shell) / 0.96), rgb(var(--kx-shell) / 0.90))',
            }}
          >
            <div className="flex items-center justify-between gap-3 px-4 pt-4">
              <div className="flex items-center gap-3">
                <Image src="/kryvexis-logo.png" alt="Kryvexis" width={32} height={32} className="h-8 w-8 object-contain" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold tracking-tight text-kx-fg truncate">Kryvexis</div>
                  <div className="text-[11px] kx-muted truncate">{props.workspaceName ?? 'Workspace'}</div>
                </div>
              </div>
              <button className="kx-icon-btn" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            {/* Company switcher shortcut */}
            {props.onOpenCompanySwitcher ? (
              <div className="px-4 pt-3">
                <button
                  onClick={() => {
                    setOpen(false)
                    props.onOpenCompanySwitcher?.()
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-[rgba(var(--kx-fg),.04)] px-3 py-2 text-left text-sm text-[rgba(var(--kx-fg),.90)]"
                >
                  Switch company
                </button>
              </div>
            ) : null}

            <div className="px-3 pt-4">
              <div className="text-[11px] uppercase tracking-wider kx-muted3 px-2">Main</div>
              <nav className="mt-2 space-y-1">
                {navMainItems.map((it) => {
                  const on = pathname === it.href || pathname.startsWith(it.href + '/')
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={
                        'kx-navlink group flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'is-active' : '')
                      }
                    >
                      <span
                        className={
                          'ml-3 ' +
                          (on
                            ? 'text-[rgba(var(--kx-fg),.92)]'
                            : 'text-[rgba(var(--kx-fg),.70)] group-hover:text-[rgba(var(--kx-fg),.90)]')
                        }
                      >
                        <NavIcon name={it.icon} />
                      </span>
                      <span className="ml-2 tracking-tight">{it.label}</span>
                      {on && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(var(--kx-accent), 0.95)' }} />
                      )}
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-5 text-[11px] uppercase tracking-wider kx-muted3 px-2">More</div>
              <nav className="mt-2 space-y-1">
                {navBottomItems.map((it) => {
                  const on = pathname === it.href || pathname.startsWith(it.href + '/')
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={
                        'kx-navlink group flex items-center rounded-xl py-2 text-sm transition ' + (on ? 'is-active' : '')
                      }
                    >
                      <span
                        className={
                          'ml-3 ' +
                          (on
                            ? 'text-[rgba(var(--kx-fg),.92)]'
                            : 'text-[rgba(var(--kx-fg),.70)] group-hover:text-[rgba(var(--kx-fg),.90)]')
                        }
                      >
                        <NavIcon name={it.icon} />
                      </span>
                      <span className="ml-2 tracking-tight">{it.label}</span>
                      {on && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(var(--kx-accent), 0.95)' }} />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {props.userEmail ? (
              <div className="mt-auto px-4 py-4">
                <div className="rounded-2xl border border-[rgba(var(--kx-border),.12)] bg-[rgba(var(--kx-fg),.04)] px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wider kx-muted3">Signed in</div>
                  <div className="mt-1 text-xs text-[rgba(var(--kx-fg),.88)] break-all">{props.userEmail}</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  )
}
