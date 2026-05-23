import type { Metadata } from "next";
import { UnauthorisedRoute } from "@ross2p/shared/components";
import { ForgotPasswordPage } from "@pages/forgot-password/ForgotPasswordPage";

export const metadata: Metadata = {
  title: "Forgot password — Mindlet",
  description: "Reset your Mindlet password",
};

export default function ForgotPasswordRoute() {
  return (
    <UnauthorisedRoute>
      <ForgotPasswordPage />
    </UnauthorisedRoute>
  );
}
