"use client";

import { useState } from "react";
import { Download, FileText, Landmark } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AFFILIATE, PAYOUTS, commissionBreakdown } from "@/lib/mock-data";
import { cn, downloadFile, formatCurrency, formatDate } from "@/lib/utils";

export default function EarningsPage() {
  const breakdown = commissionBreakdown();
  const [method, setMethod] = useState<"Bank Transfer" | "PayPal">("Bank Transfer");
  const [saved, setSaved] = useState(false);

  const payableProgress = Math.min(100, (breakdown.payable / AFFILIATE.minPayoutThreshold) * 100);
  const meetsThreshold = breakdown.payable >= AFFILIATE.minPayoutThreshold;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function exportTaxDoc() {
    downloadFile(
      `CyberVilla Affiliate Earnings Statement\nAffiliate: ${AFFILIATE.name} (${AFFILIATE.id})\nTax Year: 2026\n\nTotal Paid: ${formatCurrency(
        PAYOUTS.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0)
      )}`,
      "cybervilla-earnings-statement-2026.txt",
      "text/plain"
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Manage your payout method and review your payment history.</p>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Payable balance" subtitle="Toward your next payout threshold" />
          <div className="p-4 sm:p-5">
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(breakdown.payable)}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-brand-gradient transition-all" style={{ width: `${payableProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">
              Minimum payout threshold: {formatCurrency(AFFILIATE.minPayoutThreshold)}
            </p>
            <Badge tone={meetsThreshold ? "success" : "neutral"} className="mt-3">
              {meetsThreshold ? "Eligible for next payout" : "Below payout threshold"}
            </Badge>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Payment method" subtitle="Choose how you receive commission payouts." />
          <form onSubmit={handleSave} className="space-y-4 p-4 sm:p-5">
            <div className="flex gap-2">
              {(["Bank Transfer", "PayPal"] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    "flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium",
                    method === m ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:bg-surface-2"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

            {method === "Bank Transfer" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Account name" placeholder="Tomiwa Adebayo" />
                <Field label="Bank name" placeholder="GTBank" />
                <Field label="Account number" placeholder="0123456789" />
                <Field label="BVN (optional)" placeholder="•••••••••••" />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="PayPal email" placeholder="you@example.com" type="email" />
              </div>
            )}

            <div className="flex items-center gap-3 border-t border-border pt-4">
              <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-strong">
                Save payment details
              </button>
              {saved && <span className="text-xs font-medium text-success">Saved.</span>}
            </div>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Tax & personal information"
          subtitle="Required for payout compliance."
          action={
            <button
              onClick={exportTaxDoc}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-2"
            >
              <FileText size={13} /> Earnings statement
            </button>
          }
        />
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
          <Field label="Legal name" placeholder={AFFILIATE.name} />
          <Field label="Tax ID / TIN" placeholder="•••••••••" />
          <Field label="Country of residence" placeholder="Nigeria" />
        </div>
      </Card>

      <Card>
        <CardHeader title="Payout history" subtitle="Completed and in-progress payouts." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium sm:pr-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {PAYOUTS.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground sm:px-5">{formatDate(p.date)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Landmark size={13} /> {p.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.reference}</td>
                  <td className="px-4 py-3 sm:pr-5">
                    <Badge status={p.status}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t border-border p-3">
          <button
            onClick={() =>
              downloadFile(
                PAYOUTS.map((p) => `${p.date},${p.amount},${p.method},${p.status},${p.reference}`).join("\n"),
                "cybervilla-payout-history.csv"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-2"
          >
            <Download size={13} /> Export history
          </button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </label>
  );
}
