import { cookies } from "next/headers";
import DesktopPurchaseList from "@/components/buyers/DesktopPurchaseList";

type Item = { product_id: string; name: string; qty: number };

async function readList(): Promise<Item[]> {
  const store = await cookies();
  const raw = store.get("kx_purchase_list")?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function BuyersPurchaseListPage() {
  const items = await readList();
  return <DesktopPurchaseList items={items} />;
}
