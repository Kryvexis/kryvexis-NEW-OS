import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// 1x1 transparent gif
const GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  "base64"
);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    const mode = url.searchParams.get("mode") || "daily";
    const day = url.searchParams.get("day") || "";

    if (!companyId) {
      return new NextResponse(GIF, {
        headers: { "content-type": "image/gif", "cache-control": "no-store" },
      });
    }

    const supabase = createClient(
      env("NEXT_PUBLIC_SUPABASE_URL"),
      env("SUPABASE_SERVICE_ROLE_KEY")
    );

    await supabase.from("email_events").insert({
      company_id: companyId,
      event_type: "open",
      meta: { mode, day, ua: req.headers.get("user-agent") ?? "" },
    });

    return new NextResponse(GIF, {
      headers: { "content-type": "image/gif", "cache-control": "no-store" },
    });
  } catch {
    return new NextResponse(GIF, {
      headers: { "content-type": "image/gif", "cache-control": "no-store" },
    });
  }
}