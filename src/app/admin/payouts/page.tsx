"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, Download, Landmark, Zap, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";
import { SearchInput, Select } from "@/components/ui/Toolbar";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { useAppData } from "@/lib/store";
import { downloadFile, formatCurrency, formatDate, toCsv } from "@/lib/utils";

const STATUSES = ["All Statuses", "pending", "processing", "completed", "failed"];
const PAGE_SIZE = 8;

export default function AdminPayoutsPage() {
  const { payouts, approvePayout, rejectPayout, markPayoutPaid, processAllEligiblePayouts } = useAppData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [page, setPage] = useState(1);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  const totals = useMemo(() => {
    return payouts.reduce(
      (acc, p) => {
        if (p.status === "pending") acc.pending += p.amount;
        else if (p.status === "processing") acc.processing += p.amount;
        else if (p.status === "completed") acc.completed += p.amount;
        return acc;
      },
      { pending: 0, processing: 0, completed: 0 }
    );
  }, [payouts]);

  const eligibleCount = useMemo(
    () => payouts.filter((p) => p.status === "pending" && !p.flagged).length,
    [payouts]
  );
  const flaggedCount = useMemo(
    () => payouts.filter((p) => p.status === "pending" && p.flagged).length,
    [payouts]
  );

  const filtered = useMemo(() => {
    return payouts.filter((p) => {
      const matchesQuery = p.affiliateName.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "All Statuses" || p.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [payouts, query, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleExport() {
    const rows = filtered.map((p) => ({
      affiliate: p.affiliateName,
      requested_at: p.requestedAt,
      amount: p.amount,
      method: p.method,
      status: p.status,
      flagged: p.flagged,
      flag_reason: p.flagReason ?? "",
      reference: p.reference,
    }));
    downloadFile(toCsv(rows), `cybervilla-payouts-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function handleBulkProcess() {
    const n = processAllEligiblePayouts();
    setBulkMessage(n > 0 ? `${n} routine payout${n > 1 ? "s" : ""} sent for processing.` : "Nothing eligible right now.");
    setTimeout(() => setBulkMessage(null), 3000);
  }

  function confirmReject() {
    if (!rejectingId || !reason.trim()) return;
    rejectPayout(rejectingId, reason.trim());
    setRejectingId(null);
    setReason("");
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Routine payouts (verified affiliate, under ₦500,000, not their first) process in one click. Flagged ones
        need a closer look before you release funds.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Pending Approval" value={formatCurrency(totals.pending)} icon={Landmark} />
        <StatTile label="Processing" value={formatCurrency(totals.processing)} icon={Landmark} />
        <StatTile label="Paid Out" value={formatCurrency(totals.completed)} icon={Landmark} tone="up" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search affiliate…" className="sm:max-w-xs" />
        <Select value={status} onChange={setStatus} options={STATUSES} />
        <div className="flex items-center gap-2 sm:ml-auto">
          {bulkMessage && <span className="text-xs font-medium text-success">{bulkMessage}</span>}
          {eligibleCount > 0 && (
            <button
              onClick={handleBulkProcess}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-black hover:bg-accent-strong"
            >
              <Zap size={13} /> Process {eligibleCount} eligible
            </button>
          )}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {flaggedCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          <AlertTriangle size={14} className="shrink-0" />
          {flaggedCount} payout{flaggedCount > 1 ? "s" : ""} flagged for manual review — see the reason under each row.
        </div>
      )}

      <Card>
        <CardHeader title="Payout requests" subtitle={`${filtered.length} matching requests`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Affiliate</th>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium sm:pr-5" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 sm:px-5">
                    <Link href={`/admin/affiliates/${p.affiliateId}`} className="font-medium text-foreground hover:text-accent">
                      {p.affiliateName}
                    </Link>
                    <p className="text-xs text-muted">{p.reference}</p>
                    {p.flagged && p.status === "pending" && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-warning">
                        <AlertTriangle size={11} /> {p.flagReason}
                      </p>
                    )}
                    {p.status === "failed" && p.rejectionReason && (
                      <p className="mt-1 text-[11px] text-danger">Rejected: {p.rejectionReason}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(p.requestedAt)}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-muted">{p.method}</td>
                  <td className="px-4 py-3">
                    <Badge status={p.status}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 sm:pr-5">
                    {p.status === "pending" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => approvePayout(p.id)}
                          title="Approve & process"
                          className="rounded-md border border-border p-1.5 hover:bg-surface-2"
                        >
                          <Check size={14} className="text-success" />
                        </button>
                        <button
                          onClick={() => setRejectingId(p.id)}
                          title="Reject"
                          className="rounded-md border border-border p-1.5 hover:bg-surface-2"
                        >
                          <X size={14} className="text-danger" />
                        </button>
                      </div>
                    )}
                    {p.status === "processing" && (
                      <button
                        onClick={() => markPayoutPaid(p.id)}
                        className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-2"
                      >
                        Mark paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                    No payout requests match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
      </Card>

      <Modal open={rejectingId !== null} onClose={() => setRejectingId(null)} title="Reject payout request">
        <p className="text-sm text-muted">
          This reason is shown to the affiliate. Be specific so they know what to fix.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Bank account name doesn't match your registered name"
          className="mt-3 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setRejectingId(null)}
            className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            onClick={confirmReject}
            disabled={!reason.trim()}
            className="rounded-lg bg-danger px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject payout
          </button>
        </div>
      </Modal>
    </div>
  );
}
