import type { Metadata } from "next";
import { UnauthorisedRoute } from "@ross2p/shared/components";
import { LoginPage } from "@pages/login/LoginPage";

export const metadata: Metadata = {
  title: "Sign in — Mindlet",
  description: "Sign in to your Mindlet account",
};

export default function LoginRoute() {
  return (
    <UnauthorisedRoute>
      <LoginPage />
    </UnauthorisedRoute>
  );
}
