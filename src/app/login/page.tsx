import { Metadata } from "next";
import { UnauthorisedRoute } from "@ross2p/shared/components";
import { LoginPage } from "@pages/login/LoginPage";

export const metadata: Metadata = {
  title: "Login",
  description: "Login page",
};

export default function Login() {
  return (
    <UnauthorisedRoute>
      <LoginPage />
    </UnauthorisedRoute>
  );
}
