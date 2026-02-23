import { NextResponse } from 'next/server'

// Optional: keep this route for OAuth providers.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = url.searchParams.get('next') ?? '/dashboard'
  return NextResponse.redirect(new URL(next, url.origin))
}
