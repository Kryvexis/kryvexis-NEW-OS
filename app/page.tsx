// app/page.tsx
// Root route should never render legacy marketing/auth UI.
// Redirect based on auth state.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/sales/overview" : "/login");
}
