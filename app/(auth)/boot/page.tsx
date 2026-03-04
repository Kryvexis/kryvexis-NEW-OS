"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function BootUI() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(45% 40% at 18% 18%, rgb(var(--kx-accent) / 0.22), transparent 62%),
             radial-gradient(55% 45% at 86% 20%, rgb(var(--kx-accent-2) / 0.18), transparent 64%),
             radial-gradient(55% 45% at 55% 88%, rgb(var(--kx-accent) / 0.10), transparent 62%),
             linear-gradient(180deg, rgb(0 0 0 / 0.10), rgb(0 0 0 / 0.60))`,
        }}
      />

      <div
        className="relative w-[min(520px,92vw)] rounded-kxlg border bg-kx-surface px-7 py-8 text-center"
        style={{ borderColor: "rgb(var(--kx-border) / 0.12)" }}
      >
        <div className="mx-auto grid place-items-center">
          <Image
            src="/kryvexis-logo.png"
            alt="Kryvexis"
            width={112}
            height={112}
            priority
            className="rounded-[22px]"
          />
        </div>

        <div className="mt-3 text-xl font-extrabold tracking-tight">Kryvexis OS</div>
        <div className="mt-2 text-sm kx-muted">Preparing your workspace…</div>

        <div
          className="mt-5 h-2.5 overflow-hidden rounded-full border bg-kx-surface2"
          style={{ borderColor: "rgb(var(--kx-border) / 0.12)" }}
          aria-label="Loading"
        >
          <div className="h-full w-[40%] animate-[kxBoot_1.2s_ease-in-out_infinite] rounded-full bg-kx-accent" />
        </div>

        <div className="mt-5 text-xs kx-muted2">Secure • Fast • Multi-tenant</div>
      </div>

      <style jsx global>{`
        @keyframes kxBoot {
          0% { transform: translateX(-60%); opacity: 0.55; }
          50% { opacity: 1; }
          100% { transform: translateX(160%); opacity: 0.70; }
        }
      `}</style>
    </div>
  );
}

export default function BootPage() {
  const router = useRouter();

  React.useEffect(() => {
    let alive = true;

    (async () => {
      await new Promise((r) => setTimeout(r, 700));
      if (!alive) return;

      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!alive) return;

      if (!data?.user) router.replace("/login");
      // Let middleware choose the correct landing page based on role.
      else router.replace("/");
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  return <BootUI />;
}
