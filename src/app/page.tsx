"use client";

import { useMemo, useState } from "react";
import { ShoppingBag, Banknote, Wallet } from "lucide-react";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendChart } from "@/components/charts/TrendChart";
import { DATE_RANGES, averageOrderValue, commissionBreakdown, kpiTotals, trendForRange } from "@/lib/mock-data";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const [range, setRange] = useState<(typeof DATE_RANGES)[number]>("30 Days");

  const data = useMemo(() => trendForRange(range), [range]);
  const totals = useMemo(() => kpiTotals(data), [data]);
  const breakdown = useMemo(() => commissionBreakdown(), []);
  const aov = useMemo(() => averageOrderValue(), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">
            Welcome back — here&apos;s how your affiliate activity is performing.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-surface p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                range === r
                  ? "bg-accent text-black"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Sales" value={formatNumber(totals.sales)} icon={ShoppingBag} />
        <StatTile label="Commissions" value={formatCurrency(totals.commissions)} icon={Wallet} tone="up" />
        <StatTile label="Avg. Order Value" value={formatCurrency(aov)} icon={Banknote} />
      </div>

      <Card>
        <CardHeader title="Sales & Commissions" subtitle={`Trend over ${range.toLowerCase()}`} />
        <div className="p-2 sm:p-4">
          <TrendChart
            data={data}
            lines={[
              { key: "sales", color: "#22c55e", name: "Sales", axis: "left" },
              { key: "commissions", color: "#c154e8", name: "Commissions", axis: "right", format: "currency" },
            ]}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Commission Status Breakdown"
          subtitle="How your commissions move through the payout lifecycle"
        />
        <div className="grid grid-cols-2 gap-3 p-4 sm:p-5 lg:grid-cols-4">
          <CommissionTile label="Pending" amount={breakdown.pending} status="pending" />
          <CommissionTile label="Approved" amount={breakdown.approved} status="approved" />
          <CommissionTile label="Payable" amount={breakdown.payable} status="payable" />
          <CommissionTile label="Paid" amount={breakdown.paid} status="paid" />
        </div>
      </Card>
    </div>
  );
}

function CommissionTile({
  label,
  amount,
  status,
}: {
  label: string;
  amount: number;
  status: string;
}) {
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
