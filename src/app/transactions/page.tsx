"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Download } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, Select } from "@/components/ui/Toolbar";
import { Pagination } from "@/components/ui/Pagination";
import { TRANSACTIONS } from "@/lib/mock-data";
import type { Transaction } from "@/lib/types";
import { downloadFile, formatCurrency, formatDate, toCsv } from "@/lib/utils";

type SortKey = "date" | "amount" | "commission";

const STATUSES = ["All Statuses", "pending", "approved", "rejected", "cancelled", "refunded", "disputed"];
const SOURCE_TYPES = ["All Sources", "Link", "Code"];
const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [sourceType, setSourceType] = useState("All Sources");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const rows = TRANSACTIONS.filter((t) => {
      const q = query.toLowerCase();
      const matchesQuery =
        t.orderId.toLowerCase().includes(q) ||
        t.product.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q);
      const matchesStatus = status === "All Statuses" || t.transactionStatus === status;
      const matchesSource = sourceType === "All Sources" || t.sourceType === sourceType;
      return matchesQuery && matchesStatus && matchesSource;
    });
    const sorted = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "date") return dir * (new Date(a.date).getTime() - new Date(b.date).getTime());
      return dir * (a[sortKey] - b[sortKey]);
    });
    return sorted;
  }, [query, status, sourceType, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleExport() {
    const rows = filtered.map((t: Transaction) => ({
      order_id: t.orderId,
      date: t.date,
      product: t.product,
      quantity: t.quantity,
      amount: t.amount,
      source: t.source,
      source_type: t.sourceType,
      commission: t.commission,
      commission_status: t.commissionStatus,
      transaction_status: t.transactionStatus,
      payout_status: t.payoutStatus,
    }));
    downloadFile(toCsv(rows), `cybervilla-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Every transaction generated through your affiliate links or promotional codes.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search order ID, product, source…" className="sm:max-w-xs" />
        <Select value={status} onChange={setStatus} options={STATUSES} />
        <Select value={sourceType} onChange={setSourceType} options={SOURCE_TYPES} />
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
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Order</th>
                <SortableHeader label="Date" active={sortKey === "date"} dir={sortDir} onClick={() => toggleSort("date")} />
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Qty</th>
                <SortableHeader label="Amount" active={sortKey === "amount"} dir={sortDir} onClick={() => toggleSort("amount")} />
                <th className="px-4 py-3 font-medium">Source</th>
                <SortableHeader label="Commission" active={sortKey === "commission"} dir={sortDir} onClick={() => toggleSort("commission")} />
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium sm:pr-5">Payout</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground sm:px-5">{t.orderId}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(t.date)}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-foreground">{t.product}</td>
                  <td className="px-4 py-3 text-muted">{t.quantity}</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(t.amount)}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-muted">
                    {t.source} <span className="text-[10px]">({t.sourceType})</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-accent">{formatCurrency(t.commission)}</td>
                  <td className="px-4 py-3">
                    <Badge status={t.transactionStatus}>{t.transactionStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 sm:pr-5">
                    <Badge status={t.payoutStatus}>{t.payoutStatus}</Badge>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-sm text-muted">
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
