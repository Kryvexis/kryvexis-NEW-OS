import type { ReactNode } from 'react'
import MobileTabBar from '@/components/mobile/MobileTabBar'

export default function MobileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen kx-shell">
      <div className="mx-auto w-full max-w-md pb-24">
        {children}
      </div>
      <MobileTabBar />
    </div>
  )
}
