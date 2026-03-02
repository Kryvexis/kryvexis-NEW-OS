import MobileTabBar from "@/components/mobile/MobileTabBar";

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div className="mx-auto max-w-md px-3 pb-[calc(92px+env(safe-area-inset-bottom))] pt-3">
        {children}
      </div>
      <MobileTabBar />
    </div>
  );
}
