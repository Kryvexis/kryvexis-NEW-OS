import Link from "next/link";
import { Card } from "@/components/card";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="space-y-2">
        <div className="text-3xl font-semibold tracking-tight">Kryvexis OS — Demo Walkthrough</div>
        <div className="text-white/70">
          This page is safe to share with customers as a “how it works” demo. It explains the flow without exposing your
          data.
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link className="kx-button" href="/login">
            Sign in
          </Link>
          <Link className="kx-button" href="/signup">
            Create account
          </Link>
          <Link className="kx-button" href="/help">
            Support
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card>
          <div className="text-sm font-semibold">1) Setup once</div>
          <div className="text-sm text-white/70 mt-2">
            Add products, suppliers, and clients. Keep SKUs consistent and you’ll get clean reporting.
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold">2) Daily workflow</div>
          <div className="text-sm text-white/70 mt-2">
            Quote → convert to invoice → print / save PDF. Fast, minimal, and business-ready.
          </div>
        </Card>
        <Card>
          <div className="text-sm font-semibold">3) Control & visibility</div>
          <div className="text-sm text-white/70 mt-2">
            Record payments (EFT / cash), track balances, and view reports for sales and performance.
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-semibold">What your customer needs to get started</div>
        <ul className="mt-3 list-disc pl-5 text-sm text-white/70 space-y-1">
          <li>Internet connection + a browser (mobile or desktop)</li>
          <li>Their product list (even a basic spreadsheet)</li>
          <li>Their client list (names + contact details)</li>
          <li>Optional: logo + invoice footer details (banking, address, VAT etc.)</li>
        </ul>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Want a guided in-app tour?</div>
        <div className="text-sm text-white/70 mt-2">
          After signing in, click <span className="kx-kbd">Getting started</span> in the top bar, or press{' '}
          <span className="kx-kbd">?</span> for the help center.
        </div>
      </Card>
    </div>
  );
}
