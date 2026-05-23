import type { Metadata } from "next";
import { UnauthorisedRoute } from "@ross2p/shared/components";
import { RegistrationPage } from "@pages/registration/RegistrationPage";

export const metadata: Metadata = {
  title: "Create account — Mindlet",
  description: "Create your Mindlet account",
};

export default function RegistrationRoute() {
  return (
    <UnauthorisedRoute>
      <RegistrationPage />
    </UnauthorisedRoute>
  );
}
