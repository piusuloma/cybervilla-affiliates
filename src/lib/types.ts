export type CommissionStatus = "pending" | "approved" | "payable" | "paid" | "rejected";

export type TransactionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "disputed";

export type PromotionStatus = "active" | "expired" | "unavailable";

export interface KpiPoint {
  date: string;
  sales: number;
  commissions: number;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  commissionRate: number;
  offer?: string;
  status: PromotionStatus;
  eligible: boolean;
}

export interface AffiliateLink {
  id: string;
  label: string;
  targetType: "Storewide" | "Product";
  target: string;
  url: string;
  /** Typeable substitute for the URL — same tracking and commission as the link. */
  code: string;
  utm?: string;
  sales: number;
  commissions: number;
  createdAt: string;
  status: PromotionStatus;
  /** Product-specific links let the affiliate set their own resale price. */
  basePrice?: number;
  sellingPrice?: number;
  earningPerSale?: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  date: string;
  product: string;
  quantity: number;
  amount: number;
  source: string;
  sourceType: "Link" | "Code";
  commission: number;
  commissionStatus: CommissionStatus;
  transactionStatus: TransactionStatus;
  payoutStatus: "unpaid" | "scheduled" | "paid";
}

export interface Payout {
  id: string;
  date: string;
  amount: number;
  method: "Bank Transfer" | "PayPal";
  status: "processing" | "completed" | "failed";
  reference: string;
}

export interface AppNotification {
  id: string;
  type: "commission" | "transaction" | "payout" | "promotion";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  href?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  relatedTo?: string;
}
