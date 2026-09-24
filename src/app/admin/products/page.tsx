"use client";

import { useMemo, useState } from "react";
import { Check, Info } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SearchInput, Select } from "@/components/ui/Toolbar";
import { PRODUCTS as SEED_PRODUCTS } from "@/lib/mock-data";
import type { Product } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

const CATEGORIES = ["All Categories", ...Array.from(new Set(SEED_PRODUCTS.map((p) => p.category)))];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All Categories" || p.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  function rateFor(p: Product) {
    return drafts[p.id] ?? String(p.commissionRate);
  }

  function saveRate(id: string) {
    const value = Number(drafts[id]);
    if (Number.isNaN(value) || value < 0 || value > 100) return;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, commissionRate: value } : p)));
    setSaved(id);
    setTimeout(() => setSaved((s) => (s === id ? null : s)), 1500);
  }

  function toggleEligible(id: string) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, eligible: !p.eligible, status: !p.eligible ? "active" : "unavailable" }
          : p
      )
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Set the commission rate affiliates earn per product, and control eligibility.</p>
      <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-2 p-3 text-xs text-muted">
        <Info size={14} className="mt-0.5 shrink-0 text-accent" />
        Product name, price, and category are synced from Odoo, CyberVilla&apos;s catalog system, and can&apos;t be
        edited here. Commission rate and affiliate eligibility are program-specific overlays managed on this page.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search products…" className="sm:max-w-xs" />
        <Select value={category} onChange={setCategory} options={CATEGORIES} />
        <span className="text-xs text-muted sm:ml-auto">{filtered.length} products</span>
      </div>

      <Card>
        <CardHeader title="Commission rules" subtitle={`${products.length} products in catalog`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Commission rate</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium sm:pr-5">Eligible for affiliates</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="max-w-[240px] px-4 py-3 sm:px-5">
                    <p className="truncate font-medium text-foreground">{p.name}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.category}</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="relative w-20">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rateFor(p)}
                          onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-surface-2 py-1.5 pl-2.5 pr-6 text-sm text-foreground focus:border-accent focus:outline-none"
                        />
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">%</span>
                      </div>
                      {rateFor(p) !== String(p.commissionRate) && (
                        <button
                          onClick={() => saveRate(p.id)}
                          className="rounded-md bg-accent px-2 py-1.5 text-xs font-semibold text-black hover:bg-accent-strong"
                        >
                          Save
                        </button>
                      )}
                      {saved === p.id && <Check size={15} className="text-success" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={p.status}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 sm:pr-5">
                    <button
                      onClick={() => toggleEligible(p.id)}
                      className={cn(
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                        p.eligible ? "bg-accent" : "bg-surface-2"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform",
                          p.eligible ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
