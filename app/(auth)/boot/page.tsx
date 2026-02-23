import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

export default async function BootPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // Show the splash briefly (premium OS feel)
  await new Promise((r) => setTimeout(r, 900));

  if (!data?.user) redirect("/login");
  redirect("/dashboard");

  return <BootUI />;
}
