"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Check, Download, X } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, Select } from "@/components/ui/Toolbar";
import { Pagination } from "@/components/ui/Pagination";
import { PLATFORM_TRANSACTIONS } from "@/lib/admin-data";
import type { PlatformTransaction } from "@/lib/types";
import { downloadFile, formatCurrency, formatDate, toCsv } from "@/lib/utils";

type SortKey = "date" | "amount" | "commission";

const STATUSES = ["All Statuses", "pending", "completed", "cancelled", "refunded"];
const PAGE_SIZE = 10;

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<PlatformTransaction[]>(PLATFORM_TRANSACTIONS);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const rows = transactions.filter((t) => {
      const q = query.toLowerCase();
      const matchesQuery =
        t.orderId.toLowerCase().includes(q) ||
        t.product.toLowerCase().includes(q) ||
        t.affiliateName.toLowerCase().includes(q);
      const matchesStatus = status === "All Statuses" || t.transactionStatus === status;
      return matchesQuery && matchesStatus;
    });
    const sorted = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "date") return dir * (new Date(a.date).getTime() - new Date(b.date).getTime());
      return dir * (a[sortKey] - b[sortKey]);
    });
    return sorted;
  }, [transactions, query, status, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function decide(id: string, complete: boolean) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, transactionStatus: complete ? "completed" : "cancelled" } : t))
    );
  }

  function handleExport() {
    const rows = filtered.map((t) => ({
      order_id: t.orderId,
      date: t.date,
      affiliate: t.affiliateName,
      product: t.product,
      quantity: t.quantity,
      amount: t.amount,
      commission: t.commission,
      transaction_status: t.transactionStatus,
      payout_status: t.payoutStatus,
    }));
    downloadFile(toCsv(rows), `cybervilla-platform-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Every transaction across every affiliate. Mark pending orders completed or cancelled.</p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search order ID, affiliate, product…" className="sm:max-w-xs" />
        <Select value={status} onChange={setStatus} options={STATUSES} />
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-2 sm:ml-auto"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <Card>
        <CardHeader title="Transactions" subtitle={`${filtered.length} matching transactions`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Order</th>
                <SortableHeader label="Date" active={sortKey === "date"} dir={sortDir} onClick={() => toggleSort("date")} />
                <th className="px-4 py-3 font-medium">Affiliate</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <SortableHeader label="Amount" active={sortKey === "amount"} dir={sortDir} onClick={() => toggleSort("amount")} />
                <SortableHeader label="Commission" active={sortKey === "commission"} dir={sortDir} onClick={() => toggleSort("commission")} />
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium sm:pr-5" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground sm:px-5">{t.orderId}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(t.date)}</td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-foreground">{t.affiliateName}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-muted">{t.product}</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-3 font-medium text-accent">{formatCurrency(t.commission)}</td>
                  <td className="px-4 py-3">
                    <Badge status={t.transactionStatus}>{t.transactionStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 sm:pr-5">
                    {t.transactionStatus === "pending" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => decide(t.id, true)}
                          title="Mark completed"
                          className="rounded-md border border-border p-1.5 hover:bg-surface-2"
                        >
                          <Check size={14} className="text-success" />
                        </button>
                        <button
                          onClick={() => decide(t.id, false)}
                          title="Cancel order"
                          className="rounded-md border border-border p-1.5 hover:bg-surface-2"
                        >
                          <X size={14} className="text-danger" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
      </Card>
    </div>
  );
}

function SortableHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <th className="px-4 py-3 font-medium">
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <ArrowUpDown size={12} className={active ? "text-accent" : "text-muted"} />
        {active && <span className="sr-only">{dir}</span>}
      </button>
    </th>
  );
}
