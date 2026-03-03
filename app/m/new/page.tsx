import Link from "next/link";
import { Plus, ShoppingCart, UserPlus, PackagePlus, FileText, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

function Tile({
  title,
  desc,
  href,
  icon,
}: {
  title: string;
  desc: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-black/5 bg-white p-4 shadow-sm active:scale-[0.99] dark:border-white/10 dark:bg-zinc-900"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-black/10 bg-white p-2 dark:border-white/10 dark:bg-zinc-950">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{desc}</div>
        </div>
      </div>
    </Link>
  );
}

export default function MobileNew() {
  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold tracking-tight">New</div>

      <div className="grid grid-cols-1 gap-2">
        <Tile
          title="New Sale"
          desc="Open POS and checkout fast"
          href="/sales/pos"
          icon={<ShoppingCart className="h-5 w-5 text-emerald-600" />}
        />
        <Tile
          title="New Client"
          desc="Create a client profile"
          href="/clients/new"
          icon={<UserPlus className="h-5 w-5 text-emerald-600" />}
        />
        <Tile
          title="Restock"
          desc="Update stock quantities"
          href="/operations/stock"
          icon={<PackagePlus className="h-5 w-5 text-emerald-600" />}
        />
        <Tile
          title="New Quote"
          desc="Create a quote for a client"
          href="/quotes/new"
          icon={<FileText className="h-5 w-5 text-emerald-600" />}
        />
        <Tile
          title="New Invoice"
          desc="Create an invoice"
          href="/invoices/new"
          icon={<Receipt className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-3 text-xs text-zinc-500 shadow-sm dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">
        Tip: Mobile is intentionally simplified. For full reporting, accounting, and procurement workflows, use Desktop.
      </div>
    </div>
  );
}
