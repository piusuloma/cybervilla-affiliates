import { LayoutDashboard, Users, Receipt, Wallet, Package, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Affiliates", href: "/admin/affiliates", icon: Users },
  { label: "Transactions", href: "/admin/transactions", icon: Receipt },
  { label: "Payouts", href: "/admin/payouts", icon: Wallet },
  { label: "Products & Commissions", href: "/admin/products", icon: Package },
];
