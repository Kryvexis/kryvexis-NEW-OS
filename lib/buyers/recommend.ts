export type BuyersProduct = {
  id: string;
  name: string;
  sku: string | null;
  stock_on_hand: number | null;
  low_stock_threshold: number | null;
};

export type SalesSignal = {
  product_id: string;
  qty: number;
  days: number;
};

export type Recommendation = {
  suggestedQty: number;
  reason: string;
  velocityPerDay: number;
  targetStock: number;
};

function clampInt(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

/**
 * Simple but smart reorder math:
 * - uses velocity over a lookback window (default 14d)
 * - target stock = max(reorder_level, velocity*(leadTime+safety))
 */
export function recommendOrderQty(input: {
  product: BuyersProduct;
  sales: SalesSignal | null;
  leadTimeDays?: number;
  safetyDays?: number;
  minOrderQty?: number;
  packSize?: number;
}): Recommendation {
  const onHand = Number(input.product.stock_on_hand || 0);
  const reorderLevel = Number(input.product.low_stock_threshold || 0);

  const leadTimeDays = Math.max(0, Number(input.leadTimeDays ?? 4));
  const safetyDays = Math.max(0, Number(input.safetyDays ?? 2));
  const minOrderQty = Math.max(0, Number(input.minOrderQty ?? 0));
  const packSize = Math.max(0, Number(input.packSize ?? 0));

  const qtySold = Number(input.sales?.qty ?? 0);
  const days = Math.max(1, Number(input.sales?.days ?? 14));
  const velocityPerDay = qtySold / days;

  const coverageDays = leadTimeDays + safetyDays;
  const computedTarget = velocityPerDay * coverageDays;
  const targetStock = Math.max(reorderLevel, computedTarget);

  let rawSuggested = targetStock - onHand;
  let suggested = clampInt(rawSuggested);

  if (minOrderQty > 0) suggested = Math.max(suggested, minOrderQty);

  if (packSize > 1) {
    suggested = Math.ceil(suggested / packSize) * packSize;
  }

  const reason =
    suggested <= 0
      ? "Stock ok"
      : `Velocity ${(velocityPerDay).toFixed(2)}/day • Target ${Math.ceil(targetStock)} (lead ${leadTimeDays}d + safety ${safetyDays}d)`;

  return { suggestedQty: suggested, reason, velocityPerDay, targetStock: Math.ceil(targetStock) };
}
