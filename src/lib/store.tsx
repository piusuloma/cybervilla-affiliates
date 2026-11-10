"use client";

import { createContext, useContext, useMemo, useState } from "react";
import {
  AFFILIATES as SEED_AFFILIATES,
  PLATFORM_PAYOUTS as SEED_PAYOUTS,
  findAffiliateByReferralCode,
  flagPayout,
} from "./admin-data";
import { normaliseReferralCode, referralCodeFor } from "./referrals";
import type { AdminAffiliate, AffiliateApplication, PlatformPayout } from "./types";

export interface Registration {
  name: string;
  email: string;
  application: Omit<AffiliateApplication, "appliedAt">;
  /** Optional: someone can join without being invited. */
  referralCode?: string;
}

export type RegistrationResult =
  | { ok: true; affiliate: AdminAffiliate; sponsor?: AdminAffiliate }
  | { ok: false; field: "email" | "referralCode"; reason: string };

/**
 * Only an active affiliate can invite someone. A pending one hasn't been let
 * in yet, and a suspended or rejected one shouldn't be earning from new people.
 */
export function checkReferralCode(
  affiliates: AdminAffiliate[],
  code: string,
): { ok: true; sponsor?: AdminAffiliate } | { ok: false; reason: string } {
  if (!normaliseReferralCode(code)) return { ok: true };
  const sponsor = findAffiliateByReferralCode(affiliates, code);
  if (!sponsor) {
    return { ok: false, reason: "We don't recognise that code. Check it with the person who invited you, or leave it blank." };
  }
  if (sponsor.status !== "active") {
    return { ok: false, reason: "That code isn't accepting sign-ups right now. Leave it blank to join without one." };
  }
  return { ok: true, sponsor };
}

interface AppDataContextValue {
  affiliates: AdminAffiliate[];
  payouts: PlatformPayout[];
  approveAffiliate: (id: string) => void;
  rejectAffiliate: (id: string, reason: string) => void;
  toggleSuspend: (id: string) => void;
  /** Sign-up. The new affiliate starts pending, like any other application. */
  registerAffiliate: (registration: Registration) => RegistrationResult;
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
      registerAffiliate: ({ name, email, application, referralCode = "" }) => {
        const normalisedEmail = email.trim().toLowerCase();
        if (affiliates.some((a) => a.email.toLowerCase() === normalisedEmail)) {
          return { ok: false, field: "email", reason: "An account with this email already exists." };
        }
        const code = checkReferralCode(affiliates, referralCode);
        if (!code.ok) return { ok: false, field: "referralCode", reason: code.reason };

        const today = new Date().toISOString().slice(0, 10);
        const id = `AFF-${Date.now().toString().slice(-5)}`;
        const affiliate: AdminAffiliate = {
          id,
          name: name.trim(),
          email: normalisedEmail,
          tier: "Bronze Partner",
          status: "pending",
          joinedAt: today,
          sales: 0,
          commissions: 0,
          payableBalance: 0,
          linkCount: 0,
          application: { ...application, appliedAt: today },
          taxFormOnFile: false,
          paymentVerified: false,
          referralCode: referralCodeFor({ id, name }),
          referredBy: code.sponsor?.id,
        };
        setAffiliates((prev) => [...prev, affiliate]);
        return { ok: true, affiliate, sponsor: code.sponsor };
      },
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
