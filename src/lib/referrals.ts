/**
 * Referral bonuses: affiliates bringing in affiliates.
 *
 * Anyone who signs up with an affiliate's referral code becomes that
 * affiliate's recruit. From then on, every sale the recruit makes earns the
 * affiliate who invited them a flat bonus. CyberVilla pays it; it is never
 * taken out of the recruit's own earnings.
 *
 * Two lines this deliberately does not cross. Signing someone up earns
 * nothing on its own: the bonus comes only from a real customer buying a
 * real product. And it reaches one level up, no further. Paying for
 * recruitment, or paying out down a long chain, is what turns a referral
 * programme into a pyramid scheme, which Nigerian law treats as a crime.
 */

/** What the inviting affiliate earns on each of their recruit's qualifying orders, in NGN. */
export const REFERRAL_BONUS_PER_SALE = 1000;

/**
 * The least CyberVilla must be paying in commission on an order before it
 * earns a referral bonus, in NGN.
 *
 * Without it, a flat ₦1,000 on a ₦9,500 charger would cost more than half
 * again what we already pay the recruit. With it, the bonus is never more
 * than a fifth of the commission on the same order.
 *
 * Counted per order, on CyberVilla's commission alone. The recruit's own
 * markup is left out on purpose: they set it themselves, so counting it
 * would let them nudge a cheap order over the line.
 */
export const MIN_ORDER_COMMISSION_FOR_BONUS = 5000;

/** Whether an order is big enough to earn the inviter a bonus. */
export function qualifiesForReferralBonus(orderCommission: number): boolean {
  return orderCommission >= MIN_ORDER_COMMISSION_FOR_BONUS;
}

/**
 * Where the bonus on one recruit sale stands.
 *
 * It follows the order. Nothing is owed until the order completes, and an
 * order that is cancelled or refunded never pays a bonus, so the money
 * cannot be farmed by placing orders and sending them back.
 */
export function referralBonusStatus(
  transactionStatus: "pending" | "completed" | "cancelled" | "refunded",
  paid: boolean,
): "pending" | "approved" | "paid" | "void" {
  if (transactionStatus === "pending") return "pending";
  if (transactionStatus === "completed") return paid ? "paid" : "approved";
  return "void";
}

/** Referral codes are typed by hand, so case and stray spaces must not matter. */
export function normaliseReferralCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * An affiliate's referral code: their first name and the tail of their id.
 * The id part keeps it unique; the name part makes it something a person can
 * say out loud and remember.
 */
export function referralCodeFor(affiliate: { id: string; name: string }): string {
  const first = affiliate.name.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "");
  return `${first || "CV"}${affiliate.id.replace(/\D/g, "").slice(-4)}`;
}
