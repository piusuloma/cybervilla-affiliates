"use client";

import { useMemo, useState } from "react";
import { Link2, Tag } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, Select } from "@/components/ui/Toolbar";
import { PRODUCTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = ["All Categories", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];
const STATUSES = ["All Statuses", "active", "expired", "unavailable"];

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All Categories" || p.category === category;
      const matchesStatus = status === "All Statuses" || p.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [query, category, status]);

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Browse products, collections, and promotions you&apos;re eligible to promote.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search products…" className="sm:max-w-xs" />
        <Select value={category} onChange={setCategory} options={CATEGORIES} />
        <Select value={status} onChange={setStatus} options={STATUSES} />
        <span className="text-xs text-muted sm:ml-auto">{filtered.length} products</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <Card key={p.id} className="flex flex-col overflow-hidden">
            <div className="flex h-32 items-center justify-center bg-surface-2 text-5xl">{p.image}</div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium leading-snug text-foreground">{p.name}</h3>
                <Badge status={p.status}>{p.status}</Badge>
              </div>
              <p className="text-xs text-muted">{p.category}</p>
              {p.offer && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                  <Tag size={11} /> {p.offer}
                </span>
              )}
              <div className="mt-auto flex items-end justify-between pt-2">
                <div>
                  <p className="text-base font-semibold text-foreground">{formatCurrency(p.price)}</p>
                  <p className="text-xs text-accent">
                    {p.commissionRate}% commission ({formatCurrency(Math.round((p.price * p.commissionRate) / 100))})
                  </p>
                </div>
                <Link
                  href={{ pathname: "/links", query: { product: p.id } }}
                  aria-disabled={!p.eligible}
                  className={
                    p.eligible
                      ? "inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-black hover:bg-accent-strong"
                      : "pointer-events-none inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold text-muted"
                  }
                >
                  <Link2 size={13} /> Get Link
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted">
          No products match your filters.
        </div>
      )}
    </div>
  );
}
