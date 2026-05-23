import type { Metadata } from "next";
import { VerifyEmailPage } from "@pages/verify-email/VerifyEmailPage";

export const metadata: Metadata = {
  title: "Verify email — Mindlet",
  description: "Verify your email address",
};

export default function VerifyEmailRoute() {
  return <VerifyEmailPage />;
}
