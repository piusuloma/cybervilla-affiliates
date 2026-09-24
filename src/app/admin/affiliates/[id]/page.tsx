"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Check,
  X,
  ShoppingBag,
  Wallet,
  Link2,
  ExternalLink,
  Users,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { Modal } from "@/components/ui/Modal";
import { transactionsForAffiliate } from "@/lib/admin-data";
import { useAppData } from "@/lib/store";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";

export default function AdminAffiliateDetailPage() {
  const params = useParams<{ id: string }>();
  const { affiliates, payouts, approveAffiliate, rejectAffiliate, toggleSuspend } = useAppData();
  const affiliate = affiliates.find((a) => a.id === params.id);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const transactions = useMemo(
    () => (affiliate ? transactionsForAffiliate(affiliate.id).slice(0, 12) : []),
    [affiliate]
  );
  const affiliatePayouts = useMemo(
    () => (affiliate ? payouts.filter((p) => p.affiliateId === affiliate.id) : []),
    [affiliate, payouts]
  );

  if (!affiliate) {
    return (
      <div className="space-y-4">
        <Link href="/admin/affiliates" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={15} /> Back to affiliates
        </Link>
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted">
          Affiliate not found.
        </div>
      </div>
    );
  }

  const isPending = affiliate.status === "pending";

  function confirmReject() {
    if (!reason.trim() || !affiliate) return;
    rejectAffiliate(affiliate.id, reason.trim());
    setRejecting(false);
    setReason("");
  }

  return (
    <div className="space-y-5">
      <Link href="/admin/affiliates" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={15} /> Back to affiliates
      </Link>

      <Card>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-lg font-semibold text-white">
              {affiliate.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">{affiliate.name}</p>
              <p className="text-sm text-muted">{affiliate.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="accent">{affiliate.tier}</Badge>
                <Badge status={affiliate.status}>{affiliate.status}</Badge>
                <span className="text-xs text-muted">
                  {isPending ? "Applied" : "Joined"} {formatDate(affiliate.joinedAt)}
                </span>
                <span className="text-xs text-muted">{affiliate.id}</span>
              </div>
              {affiliate.status === "rejected" && affiliate.rejectionReason && (
                <p className="mt-2 text-xs text-danger">Rejected: {affiliate.rejectionReason}</p>
              )}
            </div>
          </div>
          {isPending ? (
            <div className="flex gap-2 self-start sm:self-center">
              <button
                onClick={() => approveAffiliate(affiliate.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black hover:bg-accent-strong"
              >
                <Check size={15} /> Approve application
              </button>
              <button
                onClick={() => setRejecting(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2"
              >
                <X size={15} className="text-danger" /> Reject
              </button>
            </div>
          ) : affiliate.status === "rejected" ? null : (
            <button
              onClick={() => toggleSuspend(affiliate.id)}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 sm:self-center"
            >
              {affiliate.status === "suspended" ? (
                <>
                  <CheckCircle2 size={15} className="text-success" /> Reactivate affiliate
                </>
              ) : (
                <>
                  <Ban size={15} className="text-danger" /> Suspend affiliate
                </>
              )}
            </button>
          )}
        </div>
      </Card>

      {isPending ? (
        <Card>
          <CardHeader title="Application" subtitle={`Submitted ${formatDate(affiliate.application.appliedAt)}`} />
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Promotional channel</p>
                <p className="mt-1 text-sm text-foreground">{affiliate.application.channel}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Channel link</p>
                <a
                  href={affiliate.application.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  {affiliate.application.channelUrl} <ExternalLink size={12} />
                </a>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Audience size</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
                  <Users size={14} className="text-muted" /> {formatNumber(affiliate.application.audienceSize)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Why they want to join</p>
              <blockquote className="mt-1 rounded-lg border border-border bg-surface-2 p-3 text-sm italic text-foreground">
                &ldquo;{affiliate.application.pitch}&rdquo;
              </blockquote>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 border-t border-border p-4 sm:grid-cols-2 sm:p-5">
            <ComplianceRow label="Tax form on file" ok={affiliate.taxFormOnFile} />
            <ComplianceRow label="Payment method verified" ok={affiliate.paymentVerified} />
          </div>
        </Card>
      ) : (
        <details className="group rounded-xl border border-border bg-surface open:pb-4">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground sm:px-5">
            Original application ({affiliate.application.channel}, {formatDate(affiliate.application.appliedAt)})
          </summary>
          <div className="grid gap-4 px-4 sm:grid-cols-2 sm:px-5">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Channel link</p>
                <a
                  href={affiliate.application.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  {affiliate.application.channelUrl} <ExternalLink size={12} />
                </a>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">Audience size</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground">
                  <Users size={14} className="text-muted" /> {formatNumber(affiliate.application.audienceSize)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Pitch</p>
              <p className="mt-1 text-sm text-muted">{affiliate.application.pitch}</p>
            </div>
          </div>
        </details>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Sales" value={formatNumber(affiliate.sales)} icon={ShoppingBag} />
        <StatTile label="Commissions" value={formatCurrency(affiliate.commissions)} icon={Wallet} tone="up" />
        <StatTile label="Payable Balance" value={formatCurrency(affiliate.payableBalance)} icon={Wallet} />
        <StatTile label="Links & Codes" value={formatNumber(affiliate.linkCount)} icon={Link2} />
      </div>

      <Card>
        <CardHeader title="Recent transactions" subtitle="Most recent 12 orders attributed to this affiliate" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium sm:pr-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground sm:px-5">{t.orderId}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(t.date)}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-foreground">{t.product}</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-3 font-medium text-accent">{formatCurrency(t.commission)}</td>
                  <td className="px-4 py-3 sm:pr-5">
                    <Badge status={t.transactionStatus}>{t.transactionStatus}</Badge>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted">
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Payout history" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Requested</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium sm:pr-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {affiliatePayouts.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground sm:px-5">{formatDate(p.requestedAt)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-muted">{p.method}</td>
                  <td className="px-4 py-3 sm:pr-5">
                    <Badge status={p.status}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
              {affiliatePayouts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted">
                    No payout requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={rejecting} onClose={() => setRejecting(false)} title="Reject application">
        <p className="text-sm text-muted">This reason is shown to the applicant.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Channel audience doesn't meet our minimum reach requirement"
          className="mt-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setRejecting(false)}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            onClick={confirmReject}
            disabled={!reason.trim()}
            className="rounded-lg bg-danger px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject application
          </button>
        </div>
      </Modal>
    </div>
  );
}

function ComplianceRow({ label, ok }: { label: string; ok: boolean }) {
  const Icon = ok ? FileCheck : AlertTriangle;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium",
        ok ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning"
      )}
    >
      <Icon size={14} />
      {label}: {ok ? "Yes" : "Not yet"}
    </div>
  );
}
