"use client";

export type PurchaseListItem = {
  product_id: string;
  name: string;
  sku?: string | null;
  suggested_qty: number;
  unit_price?: number | null;
  supplier_id?: string | null;
  supplier_name?: string | null;
  supplier_email?: string | null;
};

const KEY = "kx_purchase_list_v1";

export function loadPurchaseList(): PurchaseListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function savePurchaseList(items: PurchaseListItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function upsertPurchaseItem(item: PurchaseListItem) {
  const list = loadPurchaseList();
  const idx = list.findIndex((x) => x.product_id === item.product_id);
  if (idx >= 0) list[idx] = { ...list[idx], ...item };
  else list.unshift(item);
  savePurchaseList(list);
  return list;
}

export function removePurchaseItem(product_id: string) {
  const list = loadPurchaseList().filter((x) => x.product_id !== product_id);
  savePurchaseList(list);
  return list;
}

export function clearPurchaseList() {
  savePurchaseList([]);
}
