import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ClientPicker from "@/components/clients/ClientPicker";
import { Page } from "@/components/ui/page";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id,name,tags_json,created_at,email,phone")
    .order("name", { ascending: true })
    .limit(500);

  return (
    <Page
      title="Clients"
      subtitle="Choose Account or Cash, then select a client."
      action={<Link className="kx-button kx-button-primary" href="/clients/new">New client</Link>}
    >
      <ClientPicker clients={(clients as any) || []} />
    </Page>
  );
}
