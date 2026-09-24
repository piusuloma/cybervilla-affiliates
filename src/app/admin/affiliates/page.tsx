"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Ban, CheckCircle2, Search } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, Select } from "@/components/ui/Toolbar";
import { Pagination } from "@/components/ui/Pagination";
import { useAppData } from "@/lib/store";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

const TIERS = ["All Tiers", "Bronze Partner", "Silver Partner", "Gold Partner"];
const STATUSES = ["All Statuses", "active", "suspended", "pending", "rejected"];
const PAGE_SIZE = 8;

export default function AdminAffiliatesPage() {
  const { affiliates, toggleSuspend } = useAppData();
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("All Tiers");
  const [status, setStatus] = useState("All Statuses");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return affiliates.filter((a) => {
      const q = query.toLowerCase();
      const matchesQuery = a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
      const matchesTier = tier === "All Tiers" || a.tier === tier;
      const matchesStatus = status === "All Statuses" || a.status === status;
      return matchesQuery && matchesTier && matchesStatus;
    });
  }, [affiliates, query, tier, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pendingCount = affiliates.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Every affiliate on the platform, their tier, and lifetime performance.
        {pendingCount > 0 && (
          <span className="ml-2 font-medium text-accent">
            {pendingCount} application{pendingCount > 1 ? "s" : ""} awaiting review.
          </span>
        )}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search name or email…" className="sm:max-w-xs" />
        <Select value={tier} onChange={setTier} options={TIERS} />
        <Select value={status} onChange={setStatus} options={STATUSES} />
        <span className="text-xs text-muted sm:ml-auto">{filtered.length} affiliates</span>
      </div>

      <Card>
        <CardHeader title="Affiliates" subtitle={`${affiliates.length} total`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Affiliate</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Commissions</th>
                <th className="px-4 py-3 font-medium">Payable</th>
                <th className="px-4 py-3 font-medium sm:pr-5" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{a.tier}</td>
                  <td className="px-4 py-3">
                    <Badge status={a.status}>{a.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(a.joinedAt)}</td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(a.sales)}</td>
                  <td className="px-4 py-3 font-medium text-accent">{formatCurrency(a.commissions)}</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(a.payableBalance)}</td>
                  <td className="px-4 py-3 sm:pr-5">
                    <div className="flex items-center justify-end gap-2">
                      {a.status === "pending" ? (
                        <Link
                          href={`/admin/affiliates/${a.id}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-accent-strong"
                        >
                          <Search size={13} /> Review application
                        </Link>
                      ) : (
                        <>
                          {a.status !== "rejected" && (
                            <button
                              onClick={() => toggleSuspend(a.id)}
                              title={a.status === "suspended" ? "Reactivate" : "Suspend"}
                              className="rounded-md border border-border p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
                            >
                              {a.status === "suspended" ? (
                                <CheckCircle2 size={14} className="text-success" />
                              ) : (
                                <Ban size={14} className="text-danger" />
                              )}
                            </button>
                          )}
                          <Link
                            href={`/admin/affiliates/${a.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-surface-2"
                          >
                            View <ChevronRight size={13} />
                          </Link>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted">
                    No affiliates match your filters.
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
