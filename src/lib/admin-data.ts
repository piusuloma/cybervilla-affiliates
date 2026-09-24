import type {
  AdminAffiliate,
  KpiPoint,
  PlatformPayout,
  PlatformTransaction,
  Transaction,
} from "./types";
import { AFFILIATE, PRODUCTS } from "./mock-data";

// Separate seeded generator so admin mock data doesn't perturb the affiliate-side sequence.
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const rand = seeded(7);

export const ADMIN_USER = {
  name: "Ayodele Fashola",
  email: "ayodele.fashola@cybervilla.io",
  role: "Super Admin",
};

const NAMES = [
  "Chinedu Okafor",
  "Aisha Bello",
  "Emeka Nwosu",
  "Funmilayo Adeyemi",
  "Ibrahim Suleiman",
  "Ngozi Eze",
  "Oluwaseun Ogundipe",
  "Blessing Uche",
  "Yusuf Abdullahi",
  "Kemi Afolabi",
  "Chukwudi Obi",
  "Zainab Mohammed",
  "Tobi Awolowo",
  "Grace Etim",
];

const TIERS = ["Bronze Partner", "Silver Partner", "Gold Partner"] as const;

const CHANNELS = ["Instagram", "TikTok", "YouTube", "Blog / Website", "WhatsApp Community", "Twitter/X"] as const;
const PITCH_FOCUS = [
  "tech deals and gadget reviews",
  "budget smartphones and accessories for Nigerian buyers",
  "unboxings and hands-on device comparisons",
  "campus tech recommendations and student deals",
];

function slugEmail(name: string) {
  return `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;
}

function buildApplication(name: string, appliedAt: string): import("./types").AffiliateApplication {
  const handle = name.toLowerCase().replace(/\s+/g, "");
  const channel = CHANNELS[Math.floor(rand() * CHANNELS.length)];
  const audienceSize = Math.round(2000 + rand() * 48000);
  const focus = PITCH_FOCUS[Math.floor(rand() * PITCH_FOCUS.length)];
  const channelUrl =
    channel === "Blog / Website"
      ? `https://${handle}.blog`
      : channel === "YouTube"
      ? `https://youtube.com/@${handle}`
      : channel === "WhatsApp Community"
      ? `https://chat.whatsapp.com/${handle}group`
      : `https://${channel.toLowerCase().replace("/x", "").replace(" ", "")}.com/${handle}`;
  return {
    channel,
    channelUrl,
    audienceSize,
    pitch: `I run a ${channel} audience of about ${audienceSize.toLocaleString()} focused on ${focus}. I'd like to promote CyberVilla products to my community and share exclusive links and codes with them.`,
    appliedAt,
  };
}

export const AFFILIATES: AdminAffiliate[] = [
  {
    id: AFFILIATE.id,
    name: AFFILIATE.name,
    email: AFFILIATE.email,
    tier: AFFILIATE.tier,
    status: "active",
    joinedAt: AFFILIATE.joinedAt,
    sales: 425,
    commissions: 3950880,
    payableBalance: 1272945,
    linkCount: 5,
    application: buildApplication(AFFILIATE.name, AFFILIATE.joinedAt),
    taxFormOnFile: true,
    paymentVerified: true,
  },
  ...NAMES.map((name, i) => {
    const tier = TIERS[Math.floor(rand() * TIERS.length)];
    const tierMultiplier = tier === "Gold Partner" ? 2.4 : tier === "Silver Partner" ? 1.3 : 1;
    const sales = Math.round((20 + rand() * 180) * tierMultiplier);
    const commissions = Math.round(sales * (3200 + rand() * 4800));
    const status = i === 2 ? "suspended" : i === 7 ? "suspended" : i === 11 ? "pending" : "active";
    const joinMonthsAgo = Math.floor(2 + rand() * 20);
    const joined = new Date();
    joined.setMonth(joined.getMonth() - joinMonthsAgo);
    const appliedAt =
      status === "pending"
        ? (() => {
            const d = new Date();
            d.setDate(d.getDate() - Math.floor(1 + rand() * 6));
            return d.toISOString().slice(0, 10);
          })()
        : joined.toISOString().slice(0, 10);
    const isPending = status === "pending";
    return {
      id: `AFF-${20001 + i}`,
      name,
      email: slugEmail(name),
      tier,
      status: status as AdminAffiliate["status"],
      // Not actually "joined" yet until approved — use the application date so the list doesn't show a
      // months-old join date for someone who applied a few days ago.
      joinedAt: isPending ? appliedAt : joined.toISOString().slice(0, 10),
      sales: isPending ? 0 : sales,
      commissions: isPending ? 0 : commissions,
      payableBalance: isPending || status === "suspended" ? 0 : Math.round(commissions * (0.1 + rand() * 0.25)),
      linkCount: isPending ? 0 : 1 + Math.floor(rand() * 6),
      application: buildApplication(name, appliedAt),
      taxFormOnFile: isPending ? false : rand() > 0.15,
      paymentVerified: isPending ? false : rand() > 0.1,
    };
  }),
];

const productNames = PRODUCTS.map((p) => p.name);
const txStatuses: Transaction["transactionStatus"][] = [
  "completed",
  "completed",
  "completed",
  "completed",
  "pending",
  "pending",
  "cancelled",
  "refunded",
];
const activeAffiliates = AFFILIATES.filter((a) => a.status !== "pending");

export const PLATFORM_TRANSACTIONS: PlatformTransaction[] = Array.from({ length: 180 }).map((_, i) => {
  const affiliate = activeAffiliates[Math.floor(rand() * activeAffiliates.length)];
  const product = productNames[Math.floor(rand() * productNames.length)];
  const qty = 1 + Math.floor(rand() * 2);
  const productInfo = PRODUCTS.find((p) => p.name === product);
  const unitPrice = productInfo?.price ?? 100000;
  const amount = unitPrice * qty;
  const status = txStatuses[Math.floor(rand() * txStatuses.length)];
  const commissionRate = productInfo?.commissionRate ?? 5;
  const daysAgo = Math.floor(rand() * 90);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const isLink = rand() > 0.4;
  return {
    id: `PTX-${5000 + i}`,
    orderId: `ORD-${90000 + i * 3}`,
    date: date.toISOString().slice(0, 10),
    product,
    quantity: qty,
    amount,
    source: isLink ? `${affiliate.name.split(" ")[0]} — link` : `${affiliate.name.split(" ")[0].toUpperCase()}${100 + i}`,
    sourceType: isLink ? "Link" : "Code",
    commission: Math.round((amount * commissionRate) / 100),
    transactionStatus: status,
    payoutStatus: status === "completed" && rand() > 0.5 ? "paid" : "unpaid",
    affiliateId: affiliate.id,
    affiliateName: affiliate.name,
  };
});

const LARGE_PAYOUT_THRESHOLD = 500000;

/** Mirrors how Amazon/Shopify-style programs flag a payout for manual review instead of auto-processing it. */
export function flagPayout(
  affiliate: Pick<AdminAffiliate, "taxFormOnFile" | "paymentVerified">,
  amount: number,
  hasPriorCompletedPayout: boolean
): { flagged: boolean; flagReason?: string } {
  if (!affiliate.taxFormOnFile) return { flagged: true, flagReason: "Tax form (W-8/W-9 equivalent) not on file" };
  if (!affiliate.paymentVerified) return { flagged: true, flagReason: "Payout account not yet verified" };
  if (amount > LARGE_PAYOUT_THRESHOLD)
    return { flagged: true, flagReason: `Large payout — exceeds ₦${LARGE_PAYOUT_THRESHOLD.toLocaleString()}` };
  if (!hasPriorCompletedPayout) return { flagged: true, flagReason: "First payout for this affiliate" };
  return { flagged: false };
}

export const PLATFORM_PAYOUTS: PlatformPayout[] = activeAffiliates.flatMap((a) => {
  const history: PlatformPayout[] = [];
  const method = () => (rand() > 0.75 ? "PayPal" : "Bank Transfer");

  const pastCount = 1 + Math.floor(rand() * 3);
  for (let m = 1; m <= pastCount; m++) {
    const date = new Date();
    date.setMonth(date.getMonth() - m);
    date.setDate(26 + Math.floor(rand() * 4));
    history.push({
      id: `PPO-${a.id}-${m}`,
      affiliateId: a.id,
      affiliateName: a.name,
      requestedAt: date.toISOString().slice(0, 10),
      amount: Math.round((300000 + rand() * 900000) * (a.tier === "Gold Partner" ? 2 : a.tier === "Silver Partner" ? 1.3 : 1)),
      method: method(),
      status: "completed",
      reference: `PYT-${a.id}-${m}`,
      flagged: false,
    });
  }

  if (a.payableBalance > 0) {
    const roll = rand();
    const status: PlatformPayout["status"] = roll > 0.7 ? "pending" : roll > 0.4 ? "processing" : "completed";
    const daysAgo = Math.floor(rand() * 14);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const { flagged, flagReason } = flagPayout(a, a.payableBalance, pastCount > 0);
    history.push({
      id: `PPO-${a.id}-current`,
      affiliateId: a.id,
      affiliateName: a.name,
      requestedAt: date.toISOString().slice(0, 10),
      amount: a.payableBalance,
      method: method(),
      status,
      reference: `PYT-${a.id}-current`,
      flagged: status === "pending" ? flagged : false,
      flagReason: status === "pending" ? flagReason : undefined,
    });
  }

  return history.sort((x, y) => new Date(y.requestedAt).getTime() - new Date(x.requestedAt).getTime());
});

export function platformTotals() {
  return PLATFORM_TRANSACTIONS.reduce(
    (acc, t) => ({
      sales: acc.sales + 1,
      revenue: acc.revenue + t.amount,
      commissions: acc.commissions + t.commission,
    }),
    { sales: 0, revenue: 0, commissions: 0 }
  );
}

export function platformTrend(days: number): KpiPoint[] {
  const points: Record<string, KpiPoint> = {};
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    points[key] = { date: key, sales: 0, commissions: 0 };
  }
  PLATFORM_TRANSACTIONS.forEach((t) => {
    if (points[t.date]) {
      points[t.date].sales += 1;
      points[t.date].commissions += t.commission;
    }
  });
  return Object.values(points);
}

export function topAffiliates(n = 5) {
  return [...AFFILIATES].filter((a) => a.status === "active").sort((a, b) => b.commissions - a.commissions).slice(0, n);
}

export function topProducts(n = 5) {
  const totals = new Map<string, { product: string; sales: number; revenue: number }>();
  PLATFORM_TRANSACTIONS.forEach((t) => {
    const entry = totals.get(t.product) ?? { product: t.product, sales: 0, revenue: 0 };
    entry.sales += t.quantity;
    entry.revenue += t.amount;
    totals.set(t.product, entry);
  });
  return Array.from(totals.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
}

export function transactionsForAffiliate(id: string) {
  return PLATFORM_TRANSACTIONS.filter((t) => t.affiliateId === id);
}

export function platformCommissionBreakdown() {
  const buckets: Record<"pending" | "approved" | "paid", number> = {
    pending: 0,
    approved: 0,
    paid: 0,
  };
  PLATFORM_TRANSACTIONS.forEach((t) => {
    if (t.transactionStatus === "pending") {
      buckets.pending += t.commission;
    } else if (t.transactionStatus === "completed") {
      if (t.payoutStatus === "paid") buckets.paid += t.commission;
      else buckets.approved += t.commission;
    }
  });
  return buckets;
}
