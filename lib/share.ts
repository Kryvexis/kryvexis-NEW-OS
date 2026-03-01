import 'server-only'

export function appOrigin() {
  // Prefer explicit origin if set (useful on Vercel previews/custom domains)
  const explicit = process.env.NEXT_PUBLIC_APP_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return ''
}

export function shareQuoteUrl(token: string) {
  const origin = appOrigin()
  return `${origin}/share/quote/${token}`
}

export function shareInvoiceUrl(token: string) {
  const origin = appOrigin()
  return `${origin}/share/invoice/${token}`
}
