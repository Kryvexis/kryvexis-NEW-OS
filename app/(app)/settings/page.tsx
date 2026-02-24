import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/card'
import ThemeControls from '@/components/theme/ThemeControls'

export default async function Page() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const uid = userData.user?.id

  const { data: company } = uid
    ? await supabase
        .from('companies')
        .select('id,name,email,phone,address,logo_url')
        .eq('owner_user_id', uid)
        .maybeSingle()
    : { data: null }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-white/60">Company profile, tax, numbering, users & roles (coming).</div>
      </div>

      <Card>
        <div className="text-sm font-semibold">Company profile</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="text-white/60">Name</div>
          <div>{company?.name || '—'}</div>
          <div className="text-white/60">Email</div>
          <div>{company?.email || '—'}</div>
          <div className="text-white/60">Phone</div>
          <div>{company?.phone || '—'}</div>
          <div className="text-white/60">Address</div>
          <div>{company?.address || '—'}</div>
        </div>
        <div className="mt-4 text-xs text-white/55">Next: editable profile, invoice numbering, tax rates, theme, PDF automation.</div>
      </Card>

      <Card>
        <ThemeControls />
      </Card>


      <Card>
        <div className="text-sm font-semibold">Support</div>
        <div className="mt-2 text-sm text-white/70">Need assistance? Contact Kryvexis Support.</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="text-white/60">Email</div>
          <div><a className="underline underline-offset-4 decoration-white/20 hover:decoration-white/40" href="mailto:kryvexissolutions@gmail.com">kryvexissolutions@gmail.com</a></div>
          <div className="text-white/60">WhatsApp</div>
          <div><a className="underline underline-offset-4 decoration-white/20 hover:decoration-white/40" href="https://wa.me/27686282874" target="_blank" rel="noreferrer">+27 68 628 2874</a></div>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Email sending</div>
        <div className="mt-2 text-sm text-white/70">
          Kryvexis can email quotes/invoices using your own SMTP (no external credits).
        </div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
          <div className="font-medium text-white/80 mb-2">Add these to <span className="text-white">.env.local</span>:</div>
          <pre className="whitespace-pre-wrap">SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=you@yourdomain.com
SMTP_PASS=your_password
SMTP_FROM=Kryvexis &lt;you@yourdomain.com&gt;</pre>
        </div>
        <div className="mt-2 text-xs text-white/55">
          Tip: You can use Gmail SMTP, your hosting SMTP, Zoho, or any business email provider.
        </div>
      </Card>
    </div>
  )
}
