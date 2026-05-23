import type { PropsWithChildren } from "react";
import { AuthShell } from "@widgets/auth-shell";

/**
 * Shared layout for every auth page.
 * Renders the animated background + centered glass card via AuthShell.
 * Per-page route guards (UnauthorisedRoute) are applied inside each page
 * because verify-email and two-factor pages require a partial token.
 */
export default function AuthGroupLayout({ children }: PropsWithChildren) {
  return <AuthShell>{children}</AuthShell>;
}
