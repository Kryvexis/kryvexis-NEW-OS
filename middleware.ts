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
      setAll(cookiesToSet) {
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
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|json|txt|xml|js|css|map)$).*)'],
}
