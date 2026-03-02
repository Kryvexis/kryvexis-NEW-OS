export type ProductLite = {
  id: string;
  name: string;
  sku?: string | null;
  stock_on_hand?: number | null;
  low_stock_threshold?: number | null;
};

export type VelocityMap = Record<string, number>; // product_id -> qty sold over window

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Simple, explainable reorder suggestion.
 *
 * - Uses a 14-day sales window (qty sold) when available.
 * - Maintains a minimum target of (threshold * 2) to reduce re-order spam.
 * - Adds "lead time" coverage as (avg daily * (leadTimeDays + safetyDays)).
 */
export function suggestReorderQty(
  product: ProductLite,
  velocity: VelocityMap,
  opts?: { windowDays?: number; leadTimeDays?: number; safetyDays?: number }
) {
  const windowDays = opts?.windowDays ?? 14;
  const leadTimeDays = opts?.leadTimeDays ?? 4;
  const safetyDays = opts?.safetyDays ?? 2;

  const onHand = Number(product.stock_on_hand ?? 0);
  const threshold = Math.max(0, Number(product.low_stock_threshold ?? 0));

  const soldWindow = Number(velocity[product.id] ?? 0);
  const avgDaily = soldWindow > 0 ? soldWindow / windowDays : 0;

  const minTarget = threshold > 0 ? threshold * 2 : 0;
  const coverTarget = avgDaily > 0 ? Math.ceil(avgDaily * (leadTimeDays + safetyDays)) : 0;
  const target = Math.max(minTarget, coverTarget);

  const raw = target - onHand;
  const qty = raw > 0 ? Math.ceil(raw) : 0;

  const reasonParts: string[] = [];
  if (threshold > 0) reasonParts.push(`target ≥ ${minTarget} (2× reorder level)`);
  if (avgDaily > 0) reasonParts.push(`cover ${leadTimeDays + safetyDays} days @ ~${avgDaily.toFixed(2)}/day`);
  const reason = reasonParts.length ? reasonParts.join(" · ") : "No history yet — using reorder level only.";

  return {
    qty,
    avgDaily,
    soldWindow,
    windowDays,
    target,
    reason,
  };
}
