import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
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

  // IMPORTANT: Do not use getSession() in middleware.
  const { data } = await supabase.auth.getUser()

  // Root routing (fixes '/' showing a legacy/broken screen on some deployments).
  // - Signed out: go to /login
  // - Signed in: go to Sales overview (POS-style hub)
  const path = request.nextUrl.pathname
  if (path === '/') {
    const url = request.nextUrl.clone()
    url.pathname = data?.user ? '/sales/overview' : '/login'
    return NextResponse.redirect(url)
  }

  return response
}
