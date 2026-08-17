import type { Metadata } from "next";
import { ProtectedRoute } from "@ross2p/shared/components";
import { ChangePasswordPage } from "@pages/change-password/ChangePasswordPage";

export const metadata: Metadata = {
  title: "Change password — Mindlet",
  description: "Update your Mindlet password",
};

export default function ChangePasswordRoute() {
  return (
    <ProtectedRoute>
      <ChangePasswordPage />
    </ProtectedRoute>
  );
}
