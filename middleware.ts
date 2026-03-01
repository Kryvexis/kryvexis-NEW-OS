import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

// NOTE: Next.js middleware also runs for files in /public unless excluded.
// We must exclude PWA assets like manifest + icons, otherwise some deployments can return 401s.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest\.json|site\.webmanifest|robots\.txt|sitemap\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
