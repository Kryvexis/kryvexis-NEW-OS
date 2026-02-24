import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ClientPicker from "@/components/clients/ClientPicker";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id,name,tags_json,created_at,email,phone")
    .order("name", { ascending: true })
    .limit(500);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="kx-h1">Clients</div>
          <div className="kx-sub">Choose Account or Cash, then select a client.</div>
        </div>
        <div className="flex gap-2">
          <Link className="kx-button" href="/clients/new">Add client</Link>
        </div>
      </div>

      <ClientPicker clients={(clients as any) || []} />
    </div>
  );
}
