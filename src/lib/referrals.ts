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

/** What the inviting affiliate earns on each of their recruit's sales, in NGN. */
export const REFERRAL_BONUS_PER_SALE = 1000;

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
