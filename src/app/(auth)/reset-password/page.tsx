import type { Metadata } from "next";
import { Suspense } from "react";
import { UnauthorisedRoute } from "@ross2p/shared/components";
import { ResetPasswordPage } from "@pages/reset-password/ResetPasswordPage";

export const metadata: Metadata = {
  title: "Reset password — Mindlet",
  description: "Choose a new password for your account",
};

export default function ResetPasswordRoute() {
  return (
    <UnauthorisedRoute>
      {/* Suspense required because ResetPasswordPage reads useSearchParams */}
      <Suspense>
        <ResetPasswordPage />
      </Suspense>
    </UnauthorisedRoute>
  );
}
