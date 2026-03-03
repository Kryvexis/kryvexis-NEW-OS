import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

const COMPANY_COOKIE_KEYS = ['kx_active_company_id', 'kx_active_company', 'active_company_id', 'ACTIVE_COMPANY_ID']

function readCompanyIdFromCookies(req: NextRequest): string | null {
  for (const k of COMPANY_COOKIE_KEYS) {
    const v = req.cookies.get(k)?.value
    if (v) return v
  }
  return null
}

function normalizeRole(role: any) {
  const r = String(role || 'staff').toLowerCase()
  if (r === 'owner') return 'owner'
  if (r === 'manager') return 'manager'
  if (r === 'cashier') return 'cashier'
  if (r === 'buyer') return 'buyer'
  if (r === 'accounts') return 'accounts'
  return 'staff'
}

function landingFor(role: string, isMobile: boolean) {
  if (role === 'buyer') return isMobile ? '/m/buyers' : '/buyers'
  if (role === 'accounts') return isMobile ? '/m/transactions' : '/accounting/dashboard'
  if (role === 'cashier') return isMobile ? '/m/home' : '/sales/pos'
  // manager/owner/staff
  return isMobile ? '/m/home' : '/sales/overview'
}

function canAccess(role: string, pathname: string) {
  if (role === 'owner' || role === 'manager') return true
  const p = pathname.split('?')[0]
  const safe = ['/help', '/settings', '/account-center', '/import-station']
  if (safe.some((x) => p === x || p.startsWith(x + '/'))) return true

  if (role === 'cashier') {
    return p.startsWith('/sales') || p.startsWith('/clients') || p.startsWith('/quotes') || p.startsWith('/invoices') || p.startsWith('/payments')
  }
  if (role === 'buyer') {
    return p.startsWith('/buyers') || p.startsWith('/operations') || p.startsWith('/products') || p.startsWith('/suppliers')
  }
  if (role === 'accounts') {
    return p.startsWith('/accounting') || p.startsWith('/payments') || p.startsWith('/clients') || p.startsWith('/reports')
  }
  return p.startsWith('/sales') || p.startsWith('/clients')
}

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

  // Role lookup (best-effort). If we can't resolve role, default to staff.
  let role = 'staff'
  if (user) {
    const companyId = readCompanyIdFromCookies(request)
    if (companyId) {
      try {
        const { data: r } = await supabase
          .from('company_users')
          .select('role')
          .eq('company_id', companyId)
          .eq('user_id', user.id)
          .maybeSingle()
        role = normalizeRole(r?.role)
      } catch {
        role = 'staff'
      }
    }
  }

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
    next.pathname = landingFor(role, isMobile)
    return NextResponse.redirect(next)
  }


  // Mobile/desktop experience split:
  // - Mobile devices should use /m/* (compact UI)
  // - Desktop should avoid /m/* (full system UI)
  const ua = request.headers.get('user-agent') ?? ''
  const isMobile = MOBILE_UA.test(ua)

  // If a desktop user hits a mobile route, bounce them to the desktop home.
  if (!isMobile && pathname.startsWith('/m')) {
    const next = request.nextUrl.clone()
    next.pathname = '/sales/overview'
    return NextResponse.redirect(next)
  }

  // If a mobile user hits desktop pages, gently route to the equivalent mobile page.
  if (isMobile && !pathname.startsWith('/m')) {
    // Allow auth + public routes to pass through untouched
    const publicPrefixes = ['/login', '/signup', '/forgot-password', '/boot', '/api', '/_next', '/share', '/demo']
    if (!publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      const next = request.nextUrl.clone()
      if (pathname === '/sales/overview' || pathname === '/dashboard') next.pathname = '/m/home'
      else if (pathname === '/clients') next.pathname = '/m/clients'
      else if (pathname === '/buyers') next.pathname = '/m/buyers'
      else if (pathname === '/settings') next.pathname = '/m/settings'
      else if (pathname === '/invoices' || pathname === '/payments' || pathname === '/reports' || pathname === '/sales') next.pathname = '/m/transactions'
      else {
        // default: keep mobile users in the compact shell
        next.pathname = '/m/home'
      }
      return NextResponse.redirect(next)
    }
  }

  // Role-based gating (desktop routes). If user tries to open a module they don't need, redirect them.
  if (user) {
    const publicPrefixes = ['/login', '/signup', '/forgot-password', '/boot', '/api', '/_next', '/share', '/demo']
    if (!publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      // Only gate non-mobile routes here; /m pages are compact and already simplified.
      if (!pathname.startsWith('/m') && !canAccess(role, pathname)) {
        const next = request.nextUrl.clone()
        next.pathname = landingFor(role, isMobile)
        return NextResponse.redirect(next)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
