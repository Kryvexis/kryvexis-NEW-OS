import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Shell from "@/components/shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const user = data?.user;
  if (!user) redirect("/login");

  return <Shell userEmail={user.email ?? ""}>{children}</Shell>;
}
