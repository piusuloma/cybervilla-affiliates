import type {
  AffiliateLink,
  AppNotification,
  KpiPoint,
  Product,
  SupportTicket,
  Transaction,
} from "./types";

// Deterministic pseudo-random generator (seeded) so server and client render identically.
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

const rand = seeded(42);

export const AFFILIATE = {
  id: "AFF-10492",
  name: "Tomiwa Adebayo",
  email: "tomiwa.adebayo@example.com",
  tier: "Gold Partner",
  joinedAt: "2025-02-14",
  minPayoutThreshold: 25000,
  currency: "NGN",
};

export const DATE_RANGES = ["Today", "7 Days", "30 Days", "90 Days", "Custom"] as const;

function buildTrend(days: number): KpiPoint[] {
  const points: KpiPoint[] = [];
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const wave = Math.sin(i / 4) * 0.4 + Math.sin(i / 9) * 0.3;
    const weekendDip = d.getDay() === 0 || d.getDay() === 6 ? 0.75 : 1;
    const sales = Math.max(1, Math.round((5 + wave * 2.5 + rand() * 1.5) * weekendDip));
    const commissions = Math.round(sales * (2200 + rand() * 3500));
    points.push({
      date: d.toISOString().slice(0, 10),
      sales,
      commissions,
    });
  }
  return points;
}

export const TREND_90D = buildTrend(90);

export function trendForRange(range: (typeof DATE_RANGES)[number]): KpiPoint[] {
  switch (range) {
    case "Today":
      return TREND_90D.slice(-1);
    case "7 Days":
      return TREND_90D.slice(-7);
    case "30 Days":
      return TREND_90D.slice(-30);
    case "90 Days":
    case "Custom":
    default:
      return TREND_90D;
  }
}

// id/name/image/price/category mirror CyberVilla's Odoo catalog and will come from the Odoo API
// in production; commissionRate/offer/status/eligible are affiliate-program-specific overlay fields.
export const PRODUCTS: Product[] = [
  { id: "P-1001", name: "iPhone 15 Pro Max 256GB", image: "📱", price: 1850000, category: "Mobile Phones", commissionRate: 5, offer: "Back to School Bundle", status: "active", eligible: true },
  { id: "P-1002", name: "Samsung Galaxy S24 Ultra", image: "📱", price: 1650000, category: "Mobile Phones", commissionRate: 5, status: "active", eligible: true },
  { id: "P-1003", name: "iPhone 13 (UK Used, Recertified)", image: "📱", price: 620000, category: "Mobile Phones", commissionRate: 7, offer: "Recertified Deals", status: "active", eligible: true },
  { id: "P-1004", name: "Infinix Zero 30", image: "📱", price: 380000, category: "Mobile Phones", commissionRate: 8, status: "active", eligible: true },
  { id: "P-1005", name: "Tecno Camon 20 Pro", image: "📱", price: 290000, category: "Mobile Phones", commissionRate: 8, status: "expired", eligible: false },
  { id: "P-2001", name: "MacBook Pro 14\" M3", image: "💻", price: 2950000, category: "Laptops", commissionRate: 4, offer: "Creator Pack", status: "active", eligible: true },
  { id: "P-2002", name: "Dell XPS 13", image: "💻", price: 1450000, category: "Laptops", commissionRate: 5, status: "active", eligible: true },
  { id: "P-2003", name: "HP Pavilion 15", image: "💻", price: 980000, category: "Laptops", commissionRate: 6, status: "active", eligible: true },
  { id: "P-2004", name: "Lenovo ThinkPad E14", image: "💻", price: 890000, category: "Laptops", commissionRate: 6, status: "unavailable", eligible: false },
  { id: "P-3001", name: "iPad Air 5th Gen", image: "📱", price: 780000, category: "Tablets", commissionRate: 5, status: "active", eligible: true },
  { id: "P-3002", name: "Samsung Galaxy Tab S9", image: "📱", price: 650000, category: "Tablets", commissionRate: 5, status: "active", eligible: true },
  { id: "P-4001", name: "Oraimo FreePods 4", image: "🎧", price: 28000, category: "Accessories", commissionRate: 12, offer: "Accessory Bundle", status: "active", eligible: true },
  { id: "P-4002", name: "CyberStick 256GB USB-C", image: "🔌", price: 18500, category: "Accessories", commissionRate: 15, status: "active", eligible: true },
  { id: "P-4003", name: "20W Fast Charger", image: "🔌", price: 9500, category: "Accessories", commissionRate: 15, status: "active", eligible: true },
  { id: "P-5001", name: "iPhone 14 Screen (Original)", image: "🔧", price: 95000, category: "Phone Parts", commissionRate: 6, status: "active", eligible: true },
  { id: "P-5002", name: "iPhone 12 Screen (Original)", image: "🔧", price: 72000, category: "Phone Parts", commissionRate: 6, status: "expired", eligible: false },
];

export const AFFILIATE_LINKS: AffiliateLink[] = [
  {
    id: "LNK-001",
    label: "iPhone 15 Pro Max — Instagram bio",
    targetType: "Product",
    target: "iPhone 15 Pro Max 256GB",
    url: "https://cybervilla.io/p/iphone-15-pro-max?ref=AFF10492",
    code: "TOMIWA-IP15",
    utm: "utm_source=instagram&utm_medium=bio",
    sales: 84,
    commissions: 777000,
    createdAt: "2025-06-02",
    status: "active",
    basePrice: 1850000,
    sellingPrice: 1859250,
    earningPerSale: 9250,
  },
  {
    id: "LNK-002",
    label: "MacBook Pro M3 — blog post",
    targetType: "Product",
    target: "MacBook Pro 14\" M3",
    url: "https://cybervilla.io/p/macbook-pro-14-m3?ref=AFF10492",
    code: "TOMIWA-MAC",
    utm: "utm_source=blog&utm_medium=referral",
    sales: 12,
    commissions: 1416000,
    createdAt: "2025-11-22",
    status: "active",
    basePrice: 2950000,
    sellingPrice: 3068000,
    earningPerSale: 118000,
  },
  {
    id: "LNK-003",
    label: "CyberVilla storewide — Twitter/X",
    targetType: "Storewide",
    target: "Entire store",
    url: "https://cybervilla.io/?ref=AFF10492",
    code: "TOMIWA10",
    utm: "utm_source=twitter&utm_medium=bio",
    sales: 41,
    commissions: 246000,
    createdAt: "2025-09-10",
    status: "active",
  },
  {
    id: "LNK-004",
    label: "Recertified iPhone 13 — YouTube review",
    targetType: "Product",
    target: "iPhone 13 (UK Used, Recertified)",
    url: "https://cybervilla.io/p/iphone-13-uk-used-recertified?ref=AFF10492",
    code: "TOMIWA-IP13",
    utm: "utm_source=youtube&utm_medium=video",
    sales: 212,
    commissions: 919080,
    createdAt: "2025-05-18",
    status: "active",
    basePrice: 620000,
    sellingPrice: 649000,
    earningPerSale: 29000,
  },
  {
    id: "LNK-005",
    label: "CyberVilla storewide — WhatsApp status",
    targetType: "Storewide",
    target: "Entire store",
    url: "https://cybervilla.io/?ref=AFF10492",
    code: "TOMIWA-OLD",
    sales: 76,
    commissions: 592800,
    createdAt: "2025-03-01",
    status: "expired",
  },
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

export const TRANSACTIONS: Transaction[] = Array.from({ length: 48 }).map((_, i) => {
  const product = productNames[Math.floor(rand() * productNames.length)];
  const qty = 1 + Math.floor(rand() * 2);
  const unitPrice = PRODUCTS.find((p) => p.name === product)?.price ?? 100000;
  const amount = unitPrice * qty;
  const status = txStatuses[Math.floor(rand() * txStatuses.length)];
  const commissionRate = PRODUCTS.find((p) => p.name === product)?.commissionRate ?? 5;
  const daysAgo = Math.floor(rand() * 60);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const isLink = rand() > 0.4;
  const link = AFFILIATE_LINKS[Math.floor(rand() * AFFILIATE_LINKS.length)];
  return {
    id: `TXN-${1000 + i}`,
    orderId: `ORD-${88000 + i * 3}`,
    date: date.toISOString().slice(0, 10),
    product,
    quantity: qty,
    amount,
    source: isLink ? link.label : link.code,
    sourceType: isLink ? "Link" : "Code",
    commission: Math.round((amount * commissionRate) / 100),
    transactionStatus: status,
    payoutStatus: status === "completed" && rand() > 0.5 ? "paid" : "unpaid",
  };
});

export const NOTIFICATIONS: AppNotification[] = [
  { id: "N-1", type: "commission", title: "Commission milestone reached", body: "You've earned over ₦2,000,000 in commissions this quarter.", timestamp: "2026-09-17T09:12:00", read: false, href: "/earnings" },
  { id: "N-2", type: "transaction", title: "Order completed", body: "Order ORD-88012 (iPhone 15 Pro Max) has been completed. Commission: ₦92,500.", timestamp: "2026-09-16T14:40:00", read: false, href: "/transactions" },
  { id: "N-3", type: "payout", title: "Payout processing", body: "Your September payout of ₦892,300 is being processed via Bank Transfer.", timestamp: "2026-09-15T08:00:00", read: false, href: "/earnings" },
  { id: "N-4", type: "transaction", title: "Order cancelled", body: "Order ORD-88030 was cancelled. The associated commission has been voided.", timestamp: "2026-09-14T11:22:00", read: true, href: "/transactions" },
  { id: "N-5", type: "promotion", title: "Commission terms updated", body: "Commission rate for Accessories increased from 10% to 15%.", timestamp: "2026-09-10T16:05:00", read: true, href: "/products" },
  { id: "N-6", type: "payout", title: "Payout completed", body: "Your August payout of ₦1,245,000 was successfully paid out.", timestamp: "2026-08-31T10:00:00", read: true, href: "/earnings" },
  { id: "N-7", type: "transaction", title: "Transaction refunded", body: "Order ORD-87990 was refunded. Associated commission has been reversed.", timestamp: "2026-08-28T13:15:00", read: true, href: "/transactions" },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  { id: "TCK-441", subject: "Commission missing for order ORD-88044", category: "Commission dispute", status: "open", createdAt: "2026-09-16", relatedTo: "ORD-88044" },
  { id: "TCK-430", subject: "Unable to generate link for Recertified collection", category: "Technical issue", status: "in_progress", createdAt: "2026-09-10" },
  { id: "TCK-402", subject: "Payout account update confirmation", category: "Payments", status: "resolved", createdAt: "2026-08-20" },
];

export const FAQS = [
  { q: "When does a commission move from Pending to Approved?", a: "As soon as the order is completed — confirmed, delivered, and past the 48-hour return window — its commission moves from Pending to Approved and is queued for your next payout." },
  { q: "How do I know which link or code drove a sale?", a: "Every transaction in your Transactions table shows the exact affiliate link or promotional code used, along with the product, order ID, and resulting commission." },
  { q: "What if my customer buys something other than the product I shared?", a: "Your link and code always identify you, no matter what gets purchased. A custom selling price only applies to the exact product it was set for — if the customer buys something else instead, you still earn CyberVilla's standard commission on that purchase. Nothing is lost; just share the same link or code regardless of what they decide on." },
  { q: "What's the minimum payout threshold?", a: "Payouts are processed once your approved balance reaches ₦25,000. Balances below this roll over to the next payout cycle automatically." },
  { q: "Can I use my promo code on my own purchases?", a: "No. Self-referral using your own affiliate link or promo code is not eligible for commission and may result in commission reversal." },
  { q: "Why did a commission get reversed?", a: "Commissions are reversed when the underlying order is cancelled or refunded." },
];

export function kpiTotals(points: KpiPoint[]) {
  return points.reduce(
    (acc, p) => ({
      sales: acc.sales + p.sales,
      commissions: acc.commissions + p.commissions,
    }),
    { sales: 0, commissions: 0 }
  );
}

export function averageOrderValue() {
  if (TRANSACTIONS.length === 0) return 0;
  return TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0) / TRANSACTIONS.length;
}

export function commissionBreakdown() {
  const buckets: Record<"pending" | "approved" | "paid", number> = {
    pending: 0,
    approved: 0,
    paid: 0,
  };
  TRANSACTIONS.forEach((t) => {
    // Cancelled/refunded orders never earn a commission — they're excluded entirely.
    if (t.transactionStatus === "pending") {
      buckets.pending += t.commission;
    } else if (t.transactionStatus === "completed") {
      if (t.payoutStatus === "paid") buckets.paid += t.commission;
      else buckets.approved += t.commission;
    }
  });
  return buckets;
}
