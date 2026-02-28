"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function BootUI() {
  return (
    <div className="kx-boot">
      <div className="kx-boot-bg" aria-hidden="true" />
      <div className="kx-boot-card">
        <div className="kx-boot-logoWrap">
          <Image
            src="/kryvexis-logo.png"
            alt="Kryvexis"
            width={120}
            height={120}
            priority
            className="kx-boot-logo"
          />
        </div>
        <div className="kx-boot-title">Kryvexis OS</div>
        <div className="kx-boot-sub">Preparing your workspace…</div>
        <div className="kx-boot-bar" aria-label="Loading">
          <div className="kx-boot-barFill" />
        </div>
        <div className="kx-boot-foot">Secure • Fast • Multi-tenant</div>
      </div>
    </div>
  );
}

export default function BootPage() {
  const router = useRouter();

  React.useEffect(() => {
    let alive = true;

    (async () => {
      // show splash briefly (premium OS feel)
      await new Promise((r) => setTimeout(r, 900));
      if (!alive) return;

      const supabase = createClient();
      const { data } = await supabase.auth.getUser();

      if (!alive) return;

      if (!data?.user) router.replace("/login");
      else router.replace("/dashboard");
    })();

    return () => {
      alive = false;
    };
  }, [router]);

  return <BootUI />;
}