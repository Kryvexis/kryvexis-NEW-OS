import type { ReactNode } from 'react'
import MobileTabBar from '@/components/mobile/MobileTabBar'

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen kx-shell">
      {/*
        Extra bottom padding so content never hides behind the floating tab bar.
        Includes safe-area inset for iOS devices.
      */}
      <div className="mx-auto w-full max-w-md pb-[calc(env(safe-area-inset-bottom)+7rem)]">
        {children}
      </div>
      <MobileTabBar />
    </div>
  )
}
