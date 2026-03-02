"use server";

import { cookies } from "next/headers";

type Item = { product_id: string; name: string; qty: number };

async function readList(): Promise<Item[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("kx_purchase_list")?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? (parsed as Item[]) : [];
  } catch {
    return [];
  }
}

async function writeList(list: Item[]) {
  const cookieStore = await cookies();
  const val = encodeURIComponent(JSON.stringify(list));
  cookieStore.set("kx_purchase_list", val, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function addToPurchaseListAction(formData: FormData) {
  const product_id = String(formData.get("product_id") || "");
  const name = String(formData.get("name") || "Item");
  const qty = Math.max(1, Number(formData.get("suggested_qty") || 1));

  const list = await readList();
  const existing = list.find((i) => i.product_id === product_id);
  if (existing) {
    existing.qty = Math.max(existing.qty, qty);
  } else {
    list.push({ product_id, name, qty });
  }
  await writeList(list);
}

export async function clearPurchaseListAction() {
  await writeList([]);
}
