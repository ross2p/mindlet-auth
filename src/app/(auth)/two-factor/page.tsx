import type { Metadata } from "next";
import { TwoFactorPage } from "@pages/two-factor/TwoFactorPage";

export const metadata: Metadata = {
  title: "Two-factor authentication — Mindlet",
  description: "Confirm your identity with a verification code",
};

export default function TwoFactorRoute() {
  return <TwoFactorPage />;
}
