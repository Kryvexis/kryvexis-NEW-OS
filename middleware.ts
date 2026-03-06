import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
const COMPANY_COOKIE_KEYS = ['kx_active_company_id', 'kx_active_company', 'active_company_id', 'ACTIVE_COMPANY_ID']

const PUBLIC_ASSET_PREFIXES = ['/icons', '/images', '/assets', '/_next']
const PUBLIC_ASSET_PATHS = new Set([
  '/manifest.webmanifest',
  '/manifest.json',
  '/sw.js',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
])

function isPublicAssetPath(pathname: string) {
  if (PUBLIC_ASSET_PATHS.has(pathname)) return true
  if (pathname.startsWith('/workbox')) return true
  if (PUBLIC_ASSET_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true
  if (/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|webmanifest)$/i.test(pathname)) return true
  return false
}

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
  if (role === 'owner' || role === 'manager') return isMobile ? '/m/home' : '/sales/overview'
  return isMobile ? '/m/home' : '/sales/pos'
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

async function resolveRoleAndCompany(supabase: any, userId: string, companyId: string | null) {
  if (companyId) {
    const { data } = await supabase
      .from('company_users')
      .select('company_id, role, created_at')
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .maybeSingle()

    if (data?.company_id) {
      return {
        companyId: data.company_id as string,
        role: normalizeRole(data.role),
      }
    }
  }

  const { data: memberships } = await supabase
    .from('company_users')
    .select('company_id, role, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)

  const first = memberships?.[0]
  return {
    companyId: first?.company_id ?? null,
    role: normalizeRole(first?.role),
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

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

  let role = 'staff'
  let activeCompanyId = readCompanyIdFromCookies(request)

  if (user) {
    try {
      const resolved = await resolveRoleAndCompany(supabase, user.id, activeCompanyId)
      role = resolved.role
      activeCompanyId = resolved.companyId

      if (resolved.companyId && resolved.companyId !== readCompanyIdFromCookies(request)) {
        const cookieOptions = {
          path: '/',
          httpOnly: true,
          sameSite: 'lax' as const,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 30,
        }
        response.cookies.set('kx_active_company_id', resolved.companyId, cookieOptions)
        response.cookies.set('kx_active_company', resolved.companyId, cookieOptions)
        response.cookies.set('active_company_id', resolved.companyId, cookieOptions)
      }
    } catch {
      role = 'staff'
    }
  }

  const { pathname, searchParams } = request.nextUrl
  if (isPublicAssetPath(pathname)) return response

  if (pathname === '/' || pathname === '/home') {
    const next = request.nextUrl.clone()
    if (!user) {
      next.pathname = '/login'
      return NextResponse.redirect(next)
    }

    const ui = searchParams.get('ui')
    if (ui === 'mobile') {
      next.pathname = '/m/home'
      return NextResponse.redirect(next)
    }
    if (ui === 'desktop') {
      next.pathname = landingFor(role, false)
      return NextResponse.redirect(next)
    }

    const ua = request.headers.get('user-agent') ?? ''
    const isMobile = MOBILE_UA.test(ua)
    next.pathname = landingFor(role, isMobile)
    return NextResponse.redirect(next)
  }

  const ua = request.headers.get('user-agent') ?? ''
  const isMobile = MOBILE_UA.test(ua)

  if (!isMobile && pathname.startsWith('/m')) {
    const next = request.nextUrl.clone()
    next.pathname = landingFor(role, false)
    return NextResponse.redirect(next)
  }

  if (isMobile && !pathname.startsWith('/m')) {
    const publicPrefixes = ['/login', '/signup', '/forgot-password', '/boot', '/api', '/_next', '/share', '/demo']
    if (!publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
      const next = request.nextUrl.clone()
      if (pathname === '/sales/overview' || pathname === '/dashboard') next.pathname = '/m/home'
      else if (pathname === '/clients') next.pathname = '/m/clients'
      else if (pathname === '/buyers') next.pathname = '/m/buyers'
      else if (pathname === '/settings') next.pathname = '/m/settings'
      else if (pathname === '/invoices' || pathname === '/payments' || pathname === '/reports' || pathname === '/sales') next.pathname = '/m/transactions'
      else next.pathname = '/m/home'
      return NextResponse.redirect(next)
    }
  }

  if (user) {
    const publicPrefixes = ['/login', '/signup', '/forgot-password', '/boot', '/api', '/_next', '/share', '/demo']
    if (!publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
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
    '/((?!_next/static|_next/image|favicon.ico|manifest\\.webmanifest|manifest\\.json|sw\\.js|workbox.*|icons/|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|webmanifest)$).*)',
  ],
}
