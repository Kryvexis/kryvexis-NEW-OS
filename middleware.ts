import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { normalizeRole } from '@/lib/roles/shared'
import { landingForRole, moduleForPath, type AppModule } from '@/lib/rbac-shared'

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const COMPANY_COOKIE_KEYS = ['kx_active_company_id', 'kx_active_company', 'active_company_id', 'ACTIVE_COMPANY_ID']

function readCompanyIdFromCookies(req: NextRequest): string | null {
  for (const k of COMPANY_COOKIE_KEYS) {
    const v = req.cookies.get(k)?.value
    if (v) return v
  }
  return null
}

function defaultModules(role: string): AppModule[] {
  if (role === 'owner' || role === 'manager') return ['sales', 'procurement', 'accounting', 'operations', 'insights', 'settings']
  if (role === 'buyer') return ['procurement', 'operations', 'settings']
  if (role === 'accounts') return ['accounting', 'settings']
  return ['sales', 'settings']
}

<<<<<<< HEAD
=======
type AppModule = 'sales' | 'procurement' | 'accounting' | 'operations' | 'insights' | 'settings'
const ALL_MODULES: readonly AppModule[] = ['sales', 'procurement', 'accounting', 'operations', 'insights', 'settings'] as const

function defaultModulesForRole(role: string): AppModule[] {
  if (role === 'owner' || role === 'manager') return [...ALL_MODULES]
  if (role === 'accounts') return ['accounting', 'sales', 'settings']
  if (role === 'buyer') return ['procurement', 'operations', 'settings']
  if (role === 'cashier') return ['sales']
  return ['sales']
}

function moduleForPath(pathname: string): AppModule | null {
  const p = pathname.split('?')[0]
  if (p === '/dashboard' || p.startsWith('/sales') || p.startsWith('/clients') || p.startsWith('/quotes') || p.startsWith('/invoices') || p.startsWith('/payments')) return 'sales'
  if (p.startsWith('/buyers') || p.startsWith('/suppliers')) return 'procurement'
  if (p.startsWith('/products') || p.startsWith('/operations') || p.startsWith('/import-station')) return 'operations'
  if (p.startsWith('/accounting') || p.startsWith('/reports')) return 'accounting'
  if (p.startsWith('/insights')) return 'insights'
  if (p.startsWith('/settings') || p.startsWith('/account-center') || p.startsWith('/accounts')) return 'settings'
  return null
}

function landingFor(role: string, isMobile: boolean) {
  if (role === 'buyer') return isMobile ? '/m/buyers' : '/buyers'
  if (role === 'accounts') return isMobile ? '/m/transactions' : '/accounting/dashboard'
  if (role === 'cashier') return isMobile ? '/m/home' : '/sales/pos'
  // manager/owner
  if (role === 'owner' || role === 'manager') return isMobile ? '/m/home' : '/sales/overview'
  // staff default → POS first
  return isMobile ? '/m/home' : '/sales/pos'
}

function canAccess(role: string, pathname: string, moduleSet: Set<AppModule>) {
  if (role === 'owner' || role === 'manager') return true
  const p = pathname.split('?')[0]
  // Always allow help + auth utilities.
  if (p === '/help' || p.startsWith('/help/')) return true
  const mod = moduleForPath(p)
  if (!mod) return true
  return moduleSet.has(mod)
}

/**
 * Fixes Vercel ERR_TOO_MANY_REDIRECTS by ensuring signed-out users
 * never bounce back to '/', and by refreshing Supabase auth cookies
 * in middleware so Server Components can read the session.
 */
>>>>>>> 580a72d (RBAC modules + sidebar/nav filtering + middleware PWA exclusions + safer company routing)
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { pathname, searchParams } = request.nextUrl

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

  const { data } = await supabase.auth.getUser()
  const user = data?.user
  const ua = request.headers.get('user-agent') ?? ''
  const isMobile = MOBILE_UA.test(ua)

  let role = 'staff'
<<<<<<< HEAD
  let modules = defaultModules('staff')

  if (user) {
    const companyId = readCompanyIdFromCookies(request)
    if (companyId) {
      const { data: membership } = await supabase
        .from('company_users')
        .select('role')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .maybeSingle()
      role = normalizeRole(membership?.role)

      const { data: rows } = await supabase
        .from('role_modules')
        .select('module,enabled')
        .eq('company_id', companyId)
        .eq('role', role)
      const enabled = (rows || []).filter((r: any) => !!r.enabled).map((r: any) => r.module as AppModule)
      modules = enabled.length ? enabled : defaultModules(role)
    }
  }

=======
  let modules: AppModule[] = ['sales']
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

        // Fetch enabled modules for this role (DB-backed).
        if (role === 'owner' || role === 'manager') {
          modules = [...ALL_MODULES]
        } else {
          const { data: rm } = await supabase
            .from('role_modules')
            .select('module, enabled')
            .eq('company_id', companyId)
            .eq('role', role)
          const enabled = (rm || [])
            .filter((x: any) => x?.enabled)
            .map((x: any) => String(x.module).toLowerCase())
            .filter(Boolean)
          modules = enabled.length ? (enabled as AppModule[]) : defaultModulesForRole(role)
        }
      } catch {
        role = 'staff'
        modules = ['sales']
      }
    }
  }

  const moduleSet = new Set<AppModule>(modules)

  const { pathname, searchParams } = request.nextUrl

  // Never redirect or gate static/PWA endpoints.
  const STATIC_ALLOW = [
    '/manifest.webmanifest',
    '/sw.js',
    '/workbox',
    '/icons',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ]
  if (STATIC_ALLOW.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return response
  }

  // Root entry points routing
>>>>>>> 580a72d (RBAC modules + sidebar/nav filtering + middleware PWA exclusions + safer company routing)
  if (pathname === '/' || pathname === '/home') {
    const next = request.nextUrl.clone()
    if (!user) {
      next.pathname = '/login'
      return NextResponse.redirect(next)
    }
    const ui = searchParams.get('ui')
    if (ui === 'mobile') next.pathname = '/m/home'
    else if (ui === 'desktop') next.pathname = landingForRole(role as any, false)
    else next.pathname = landingForRole(role as any, isMobile)
    return NextResponse.redirect(next)
  }

  const publicPrefixes = ['/login', '/signup', '/forgot-password', '/boot', '/api', '/_next', '/share', '/demo', '/icons', '/manifest.webmanifest', '/sw.js', '/workbox', '/favicon.ico', '/robots.txt', '/sitemap.xml']
  if (publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) return response

  if (!isMobile && pathname.startsWith('/m')) {
    const next = request.nextUrl.clone()
    next.pathname = landingForRole(role as any, false)
    return NextResponse.redirect(next)
  }

  if (isMobile && !pathname.startsWith('/m')) {
<<<<<<< HEAD
    const next = request.nextUrl.clone()
    if (pathname.startsWith('/buyers')) next.pathname = '/m/buyers'
    else if (pathname.startsWith('/settings')) next.pathname = '/m/settings'
    else if (pathname.startsWith('/clients')) next.pathname = '/m/clients'
    else next.pathname = '/m/home'
    return NextResponse.redirect(next)
  }

  if (user && !pathname.startsWith('/m')) {
    const module = moduleForPath(pathname)
    if (module && role !== 'owner' && role !== 'manager' && !modules.includes(module)) {
      const next = request.nextUrl.clone()
      next.pathname = landingForRole(role as any, isMobile)
      return NextResponse.redirect(next)
=======
    // Allow auth + public routes to pass through untouched
    const publicPrefixes = ['/login', '/signup', '/forgot-password', '/boot', '/api', '/_next', '/share', '/demo', '/manifest.webmanifest', '/sw.js', '/workbox', '/icons', '/favicon.ico', '/robots.txt', '/sitemap.xml']
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
    const publicPrefixes = ['/login', '/signup', '/forgot-password', '/boot', '/api', '/_next', '/share', '/demo', '/manifest.webmanifest', '/sw.js', '/workbox', '/icons', '/favicon.ico', '/robots.txt', '/sitemap.xml']
    if (!publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      // Only gate non-mobile routes here; /m pages are compact and already simplified.
      if (!pathname.startsWith('/m') && !canAccess(role, pathname, moduleSet)) {
        const next = request.nextUrl.clone()
        next.pathname = landingFor(role, isMobile)
        return NextResponse.redirect(next)
      }
>>>>>>> 580a72d (RBAC modules + sidebar/nav filtering + middleware PWA exclusions + safer company routing)
    }
  }

  return response
}

export const config = {
<<<<<<< HEAD
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|txt|xml|js|css|map)$).*)'],
=======
  matcher: [
    // Run on everything except Next internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|sw\\.js|workbox.*|icons/.*|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
>>>>>>> 580a72d (RBAC modules + sidebar/nav filtering + middleware PWA exclusions + safer company routing)
}
