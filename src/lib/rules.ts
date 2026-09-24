/**
 * The rules an affiliate's earnings are built from.
 *
 * A CyberVilla affiliate earns a markup: they decide what to sell a product
 * for, above the price CyberVilla itself charges, and keep the difference.
 * The cap is the whole safety net. Without it an affiliate can quietly price
 * CyberVilla out of its own market, and a buyer who wanders onto the public
 * product page sees a number that makes the affiliate look like a fraud. So
 * every price the dashboard accepts is checked here, not in whichever screen
 * happens to be asking.
 *
 * This is the dashboard's copy of the rule. When link creation moves behind
 * the API the server must apply the same cap: a number typed into a browser
 * is a request, never a fact.
 */

/** The most an affiliate may add to CyberVilla's price, as a percentage. */
export const MAX_MARKUP_PERCENT = 10;

/** The highest price this product may be sold at, rounded down to stay inside the cap. */
export function maxSellingPrice(basePrice: number): number {
  if (basePrice <= 0) return 0;
  return Math.floor(basePrice * (1 + MAX_MARKUP_PERCENT / 100));
}

/** What percentage above CyberVilla's price this selling price represents. */
export function markupPercentFor(basePrice: number, sellingPrice: number): number {
  if (basePrice <= 0) return 0;
  return Math.round(((sellingPrice - basePrice) / basePrice) * 10000) / 100;
}

/** What the affiliate keeps on one sale at this price. */
export function earningFor(basePrice: number, sellingPrice: number): number {
  return Math.max(0, sellingPrice - basePrice);
}

/** The selling price a given markup works out to. */
export function sellingPriceFor(basePrice: number, markupPercent: number): number {
  return Math.round(basePrice * (1 + markupPercent / 100));
}

/**
 * Whether a price may be used, and if not, what to tell the affiliate.
 *
 * The reason is written to be shown as-is: someone who has just had a price
 * rejected wants to know what to type instead, not which rule they broke.
 */
export function checkSellingPrice(
  basePrice: number,
  sellingPrice: number,
): { ok: true } | { ok: false; reason: string } {
  if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
    return { ok: false, reason: "Enter the price you want to sell this at." };
  }
  if (sellingPrice < basePrice) {
    return { ok: false, reason: "You can't sell below CyberVilla's price." };
  }
  if (sellingPrice > maxSellingPrice(basePrice)) {
    return {
      ok: false,
      reason: `You can add up to ${MAX_MARKUP_PERCENT}% — that's ${new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }).format(maxSellingPrice(basePrice))} at most.`,
    };
  }
  return { ok: true };
}

/** Whether a storewide markup percentage is one we accept. */
export function checkMarkupPercent(
  markupPercent: number,
): { ok: true } | { ok: false; reason: string } {
  if (!Number.isFinite(markupPercent) || markupPercent < 0) {
    return { ok: false, reason: "Enter a markup between 0 and " + MAX_MARKUP_PERCENT + "%." };
  }
  if (markupPercent > MAX_MARKUP_PERCENT) {
    return { ok: false, reason: `${MAX_MARKUP_PERCENT}% is the most you can add.` };
  }
  return { ok: true };
}
