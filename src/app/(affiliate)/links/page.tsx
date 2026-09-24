"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Check, Plus, AlertCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Toolbar";
import { AFFILIATE, AFFILIATE_LINKS, PRODUCTS } from "@/lib/mock-data";
import type { AffiliateLink } from "@/lib/types";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

const ELIGIBLE_PRODUCTS = PRODUCTS.filter((p) => p.eligible);

function generateCode(existing: string[]) {
  const handle = AFFILIATE.name.split(" ")[0].toUpperCase();
  let code = "";
  do {
    code = `${handle}${Math.floor(100 + Math.random() * 900)}`;
  } while (existing.includes(code));
  return code;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // clipboard unavailable — no-op
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-foreground"
    >
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
        } catch {
          // clipboard unavailable — no-op
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title="Copy code"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-semibold tracking-wide text-accent hover:bg-surface-2"
    >
      {code}
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted" />}
    </button>
  );
}

function LinksContent() {
  const params = useSearchParams();
  const presetProduct = params.get("product");

  const [links, setLinks] = useState<AffiliateLink[]>(AFFILIATE_LINKS);

  const initialTarget =
    (presetProduct && PRODUCTS.find((p) => p.id === presetProduct)?.name) || ELIGIBLE_PRODUCTS[0]?.name || "";

  const [targetType, setTargetType] = useState<AffiliateLink["targetType"]>(presetProduct ? "Product" : "Storewide");
  const [target, setTarget] = useState(initialTarget);
  const [sellingPrice, setSellingPrice] = useState<string>(
    String(PRODUCTS.find((p) => p.name === initialTarget)?.price ?? "")
  );
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [generated, setGenerated] = useState<AffiliateLink | null>(null);

  const basePrice = useMemo(() => PRODUCTS.find((p) => p.name === target)?.price ?? 0, [target]);
  const sellingPriceNum = Number(sellingPrice);
  const earning = sellingPriceNum > 0 ? sellingPriceNum - basePrice : 0;
  const priceValid = targetType !== "Product" || (sellingPrice !== "" && sellingPriceNum >= basePrice);

  function handleGenerate() {
    if (!priceValid) return;
    const utmParts = [utmSource && `utm_source=${utmSource}`, utmMedium && `utm_medium=${utmMedium}`].filter(
      Boolean
    );
    const utm = utmParts.join("&");

    let base: string;
    let label: string;
    let extra: Partial<AffiliateLink> = {};

    if (targetType === "Product") {
      const slug = target.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      base = `https://cybervilla.io/p/${slug}`;
      label = `${target} — new link`;
      extra = { basePrice, sellingPrice: sellingPriceNum, earningPerSale: earning };
    } else {
      base = "https://cybervilla.io/";
      label = "Storewide — new link";
    }

    const priceParam = targetType === "Product" ? `&price=${sellingPriceNum}` : "";
    const code = generateCode(links.map((l) => l.code));
    const url = `${base}?ref=AFF10492${priceParam}${utm ? `&${utm}` : ""}`;

    const newLink: AffiliateLink = {
      id: `LNK-${String(links.length + 1).padStart(3, "0")}`,
      label,
      targetType,
      target: targetType === "Product" ? target : "Entire store",
      url,
      code,
      utm: utm || undefined,
      sales: 0,
      commissions: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      status: "active",
      ...extra,
    };
    setLinks((prev) => [newLink, ...prev]);
    setGenerated(newLink);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Every link comes with a matching code you can say or text instead. Both always identify you, so you&apos;re
        credited at CyberVilla&apos;s standard rate no matter what the customer ends up buying — set a selling
        price on a product link or code and you&apos;ll additionally earn the markup whenever that exact product is
        the one purchased.
      </p>

      <Card>
        <CardHeader title="Generate a new affiliate link" subtitle="Links and codes carry your unique tracking identifier automatically." />
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">Destination type</label>
            <Select
              value={targetType}
              onChange={(v) => setTargetType(v as AffiliateLink["targetType"])}
              options={["Storewide", "Product"]}
              className="w-full"
            />
          </div>

          {targetType === "Product" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted">Product</label>
              <Select
                value={target}
                onChange={(name) => {
                  setTarget(name);
                  setSellingPrice(String(PRODUCTS.find((p) => p.name === name)?.price ?? ""));
                }}
                options={ELIGIBLE_PRODUCTS.map((p) => p.name)}
                className="w-full"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">UTM source (optional)</label>
            <input
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="instagram"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted">UTM medium (optional)</label>
            <input
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="bio"
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {targetType === "Product" && (
          <div className="border-t border-border p-4 sm:p-5">
            <label className="text-xs font-medium text-muted">Your selling price</label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-[220px]">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">₦</span>
                <input
                  type="number"
                  min={basePrice}
                  step={500}
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className={cn(
                    "w-full rounded-lg border bg-surface-2 py-2 pl-7 pr-3 text-sm text-foreground focus:outline-none",
                    priceValid ? "border-border focus:border-accent" : "border-danger focus:border-danger"
                  )}
                />
              </div>
              <span className="text-xs text-muted">Base price: {formatCurrency(basePrice)}</span>
              {priceValid ? (
                <span className="text-xs font-medium text-success">
                  You&apos;ll earn {formatCurrency(earning)} per sale
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-danger">
                  <AlertCircle size={13} /> Can&apos;t sell below the base price
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted">
              This markup applies when the customer buys {target || "this product"}. If they buy something else
              instead, the link or code still credits you — just at CyberVilla&apos;s standard commission rate for
              whatever they purchase.
            </p>
          </div>
        )}

        <div className="space-y-3 border-t border-border p-4 sm:p-5">
          <button
            onClick={handleGenerate}
            disabled={!priceValid}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} /> Generate Link & Code
          </button>
          {generated && (
            <div className="space-y-2 rounded-lg border border-border bg-surface-2 p-3">
              <div className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted">Link</span>
                <code className="min-w-0 flex-1 truncate text-xs text-foreground">{generated.url}</code>
                <CopyButton text={generated.url} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted">Code</span>
                <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                  Say or text <span className="font-semibold text-accent">{generated.code}</span> as a substitute
                </span>
                <CopyButton text={generated.code} />
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Your links & codes" subtitle={`${links.length} generated`} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium sm:px-5">Link</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Your price</th>
                <th className="px-4 py-3 font-medium">Sales</th>
                <th className="px-4 py-3 font-medium">Commissions</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium sm:pr-5" />
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0">
                  <td className="max-w-[220px] px-4 py-3 sm:px-5">
                    <p className="truncate font-medium text-foreground">{l.label}</p>
                    <p className="truncate text-xs text-muted">{l.url}</p>
                  </td>
                  <td className="px-4 py-3">
                    <CopyableCode code={l.code} />
                  </td>
                  <td className="px-4 py-3 text-muted">{l.targetType}</td>
                  <td className="px-4 py-3 text-muted">
                    {l.sellingPrice ? (
                      <>
                        <span className="text-foreground">{formatCurrency(l.sellingPrice)}</span>
                        <span className="block text-xs text-success">
                          +{formatCurrency(l.earningPerSale ?? 0)}/sale
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground">{formatNumber(l.sales)}</td>
                  <td className="px-4 py-3 font-medium text-accent">{formatCurrency(l.commissions)}</td>
                  <td className="px-4 py-3">
                    <Badge status={l.status}>{l.status}</Badge>
                  </td>
                  <td className="px-4 py-3 sm:pr-5">
                    <CopyButton text={l.url} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function LinksPage() {
  return (
    <Suspense fallback={null}>
      <LinksContent />
    </Suspense>
  );
}
