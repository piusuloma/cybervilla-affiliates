"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { AFFILIATES as SEED_AFFILIATES, PLATFORM_PAYOUTS as SEED_PAYOUTS, flagPayout } from "./admin-data";
import type { AdminAffiliate, PlatformPayout } from "./types";

interface AppDataContextValue {
  affiliates: AdminAffiliate[];
  payouts: PlatformPayout[];
  approveAffiliate: (id: string) => void;
  rejectAffiliate: (id: string, reason: string) => void;
  toggleSuspend: (id: string) => void;
  requestPayout: (affiliateId: string, affiliateName: string, amount: number, method: PlatformPayout["method"]) => void;
  approvePayout: (id: string) => void;
  rejectPayout: (id: string, reason: string) => void;
  markPayoutPaid: (id: string) => void;
  processAllEligiblePayouts: () => number;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [affiliates, setAffiliates] = useState<AdminAffiliate[]>(SEED_AFFILIATES);
  const [payouts, setPayouts] = useState<PlatformPayout[]>(SEED_PAYOUTS);

  const value = useMemo<AppDataContextValue>(
    () => ({
      affiliates,
      payouts,
      approveAffiliate: (id) =>
        setAffiliates((prev) => prev.map((a) => (a.id === id ? { ...a, status: "active" } : a))),
      rejectAffiliate: (id, reason) =>
        setAffiliates((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "rejected", rejectionReason: reason } : a))
        ),
      toggleSuspend: (id) =>
        setAffiliates((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: a.status === "suspended" ? "active" : "suspended" } : a))
        ),
      requestPayout: (affiliateId, affiliateName, amount, method) => {
        const affiliate = affiliates.find((a) => a.id === affiliateId);
        const hasPriorCompletedPayout = payouts.some(
          (p) => p.affiliateId === affiliateId && p.status === "completed"
        );
        const { flagged, flagReason } = affiliate
          ? flagPayout(affiliate, amount, hasPriorCompletedPayout)
          : { flagged: true, flagReason: "Affiliate record not found" };
        setPayouts((prev) => [
          {
            id: `PPO-req-${Date.now()}`,
            affiliateId,
            affiliateName,
            requestedAt: new Date().toISOString().slice(0, 10),
            amount,
            method,
            status: "pending",
            reference: `PYT-${affiliateId}-${Date.now().toString().slice(-5)}`,
            flagged,
            flagReason,
          },
          ...prev,
        ]);
      },
      approvePayout: (id) =>
        setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "processing" } : p))),
      rejectPayout: (id, reason) =>
        setPayouts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "failed", rejectionReason: reason } : p))
        ),
      markPayoutPaid: (id) =>
        setPayouts((prev) => prev.map((p) => (p.id === id ? { ...p, status: "completed" } : p))),
      processAllEligiblePayouts: () => {
        const eligibleCount = payouts.filter((p) => p.status === "pending" && !p.flagged).length;
        if (eligibleCount > 0) {
          setPayouts((prev) =>
            prev.map((p) => (p.status === "pending" && !p.flagged ? { ...p, status: "processing" } : p))
          );
        }
        return eligibleCount;
      },
    }),
    [affiliates, payouts]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
