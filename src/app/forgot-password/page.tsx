import type { Metadata } from "next";
import { UnauthorisedRoute } from "@ross2p/shared/components";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPassword() {
  return (
    <UnauthorisedRoute>
      <div className="p-4 max-w-md">
        <h1 className="text-xl font-semibold mb-2">Forgot password</h1>
        <p className="text-muted-foreground">Flow coming soon.</p>
      </div>
    </UnauthorisedRoute>
  );
}
