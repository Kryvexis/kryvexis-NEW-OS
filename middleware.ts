import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MOBILE_UA =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Only redirect entry points
  if (pathname !== "/" && pathname !== "/home") return NextResponse.next();

  const ui = searchParams.get("ui");
  if (ui === "desktop") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  if (ui === "mobile") {
    const url = req.nextUrl.clone();
    url.pathname = "/m/home";
    return NextResponse.redirect(url);
  }

  const ua = req.headers.get("user-agent") ?? "";
  const isMobile = MOBILE_UA.test(ua);

  const url = req.nextUrl.clone();
  url.pathname = isMobile ? "/m/home" : "/dashboard";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/home"],
};
