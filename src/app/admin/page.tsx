"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Wallet, Users, Receipt } from "lucide-react";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendChart } from "@/components/charts/TrendChart";
import {
  AFFILIATES,
  platformCommissionBreakdown,
  platformTotals,
  platformTrend,
  topAffiliates,
  topProducts,
} from "@/lib/admin-data";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

const RANGES = ["7 Days", "30 Days", "90 Days"] as const;
const RANGE_DAYS: Record<(typeof RANGES)[number], number> = { "7 Days": 7, "30 Days": 30, "90 Days": 90 };

export default function AdminOverviewPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("30 Days");

  const totals = useMemo(() => platformTotals(), []);
  const breakdown = useMemo(() => platformCommissionBreakdown(), []);
  const trend = useMemo(() => platformTrend(RANGE_DAYS[range]), [range]);
  const affiliates = useMemo(() => topAffiliates(5), []);
  const products = useMemo(() => topProducts(5), []);
  const activeCount = AFFILIATES.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Platform-wide performance across every affiliate.</p>
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-surface p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                range === r ? "bg-accent text-black" : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total Sales" value={formatNumber(totals.sales)} icon={ShoppingBag} />
        <StatTile label="Revenue" value={formatCurrency(totals.revenue)} icon={Receipt} />
        <StatTile label="Commissions Owed" value={formatCurrency(totals.commissions)} icon={Wallet} tone="up" />
        <StatTile label="Active Affiliates" value={formatNumber(activeCount)} icon={Users} />
      </div>

      <Card>
        <CardHeader title="Sales & Commissions" subtitle={`Platform trend over ${range.toLowerCase()}`} />
        <div className="p-2 sm:p-4">
          <TrendChart
            data={trend}
            lines={[
              { key: "sales", color: "#22c55e", name: "Sales", axis: "left" },
              { key: "commissions", color: "#c154e8", name: "Commissions", axis: "right", format: "currency" },
            ]}
          />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top Affiliates" subtitle="Ranked by commissions earned" />
          <div className="divide-y divide-border">
            {affiliates.map((a, i) => (
              <Link
                key={a.id}
                href={`/admin/affiliates/${a.id}`}
                className="flex items-center justify-between gap-3 p-4 hover:bg-surface-2 sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-muted">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted">{a.tier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-accent">{formatCurrency(a.commissions)}</p>
                  <p className="text-xs text-muted">{formatNumber(a.sales)} sales</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Top Products" subtitle="Ranked by revenue driven through affiliates" />
          <div className="divide-y divide-border">
            {products.map((p, i) => (
              <div key={p.product} className="flex items-center justify-between gap-3 p-4 sm:px-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-muted">
                    {i + 1}
                  </span>
                  <p className="max-w-[220px] truncate text-sm font-medium text-foreground">{p.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{formatCurrency(p.revenue)}</p>
                  <p className="text-xs text-muted">{formatNumber(p.sales)} units</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Commission Status Breakdown" subtitle="Platform-wide, across every affiliate" />
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:p-5">
          <CommissionTile label="Pending" amount={breakdown.pending} status="pending" />
          <CommissionTile label="Approved" amount={breakdown.approved} status="approved" />
          <CommissionTile label="Paid" amount={breakdown.paid} status="paid" />
        </div>
      </Card>
    </div>
  );
}

function CommissionTile({ label, amount, status }: { label: string; amount: number; status: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <Badge status={status}>{status}</Badge>
      </div>
      <div className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(amount)}</div>
    </div>
  );
}
