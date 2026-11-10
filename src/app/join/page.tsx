import type { Metadata } from "next";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = {
  title: "Join the CyberVilla Affiliate Programme",
  description: "Apply to become a CyberVilla affiliate and earn on every sale you drive.",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { ref } = await searchParams;
  const initialCode = Array.isArray(ref) ? ref[0] : ref;
  return <JoinForm initialCode={initialCode ?? ""} />;
}
