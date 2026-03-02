import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Basic UA heuristic for mobile devices.
// Note: Users can override routing with ?ui=desktop or ?ui=mobile.
const MOBILE_UA =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname, searchParams } = url;

  // Only redirect entry points so the rest of the app behaves normally.
  if (pathname !== "/" && pathname !== "/home") return NextResponse.next();

  // Manual overrides:
  //   ?ui=desktop -> stay on web dashboard
  //   ?ui=mobile  -> go to mobile home
  const ui = searchParams.get("ui");
  if (ui === "mobile") {
    url.pathname = "/m/home";
    searchParams.delete("ui");
    url.search = searchParams.toString();
    return NextResponse.redirect(url);
  }
  if (ui === "desktop") {
    url.pathname = "/dashboard";
    searchParams.delete("ui");
    url.search = searchParams.toString();
    return NextResponse.redirect(url);
  }

  const ua = req.headers.get("user-agent") ?? "";
  const isMobile = MOBILE_UA.test(ua);

  // Mobile: send to mobile overview
  if (isMobile) {
    url.pathname = "/m/home";
    return NextResponse.redirect(url);
  }

  // Desktop: send to web overview/dashboard
  url.pathname = "/dashboard";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/home"],
};
