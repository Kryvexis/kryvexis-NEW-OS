import { Card } from '@/components/card'

export default function Page() {
  return (
    <div className="kx-page space-y-4">
      <div>
        <div className="kx-h1">Help & Support</div>
        <div className="kx-muted">Get assistance, report issues, or ask for new features.</div>
      </div>

      <Card>
        <div className="kx-h2">Contact Kryvexis Support</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="kx-label">Email</div>
            <a className="kx-link text-sm" href="mailto:kryvexissolutions@gmail.com">kryvexissolutions@gmail.com</a>
            <div className="text-xs text-white/50 mt-1">Best for invoices, screenshots, and detailed help.</div>
          </div>

          <div>
            <div className="kx-label">WhatsApp</div>
            <a className="kx-link text-sm" href="https://wa.me/27686282874" target="_blank" rel="noreferrer">+27 68 628 2874</a>
            <div className="text-xs text-white/50 mt-1">Fast support for quick questions.</div>
          </div>
        </div>

        <div className="kx-divider" />

        <div className="text-sm text-white/70">
          <div className="font-medium text-white/85 mb-2">Common fixes</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-white/65">
            <li>If pages feel stuck, refresh and try again.</li>
            <li>If you changed <span className="text-white">.env.local</span>, restart the dev server.</li>
            <li>For billing / plan upgrades (EFT or cash), message us on WhatsApp or email for activation.</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
