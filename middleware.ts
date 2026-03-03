import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

/**
 * Fixes Vercel ERR_TOO_MANY_REDIRECTS by ensuring signed-out users
 * never bounce back to '/', and by refreshing Supabase auth cookies
 * in middleware so Server Components can read the session.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env is missing, do not block the app — just skip auth-aware redirects.
  if (!url || !anon) return response

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Use getUser() (not getSession()) in middleware.
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  const { pathname, searchParams } = request.nextUrl

  // Root entry points routing
  if (pathname === '/' || pathname === '/home') {
    const next = request.nextUrl.clone()

    // Signed out → always go to /login (prevents redirect loop with /(app) layout).
    if (!user) {
      next.pathname = '/login'
      return NextResponse.redirect(next)
    }

    // Signed in → choose UI
    const ui = searchParams.get('ui')
    if (ui === 'mobile') {
      next.pathname = '/m/home'
      return NextResponse.redirect(next)
    }
    if (ui === 'desktop') {
      next.pathname = '/sales/overview'
      return NextResponse.redirect(next)
    }

    const ua = request.headers.get('user-agent') ?? ''
    const isMobile = MOBILE_UA.test(ua)
    next.pathname = isMobile ? '/m/home' : '/sales/overview'
    return NextResponse.redirect(next)
  }

  return response
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
