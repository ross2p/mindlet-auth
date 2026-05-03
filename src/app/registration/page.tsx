import { Metadata } from "next";
import { UnauthorisedRoute } from "@ross2p/shared/components";
import { RegistrationPage } from "@pages/registration/RegistrationPage";

export const metadata: Metadata = {
  title: "Registration",
  description: "Registration page",
};

export default function Registration() {
  return (
    <UnauthorisedRoute>
      <RegistrationPage />
    </UnauthorisedRoute>
  );
}
