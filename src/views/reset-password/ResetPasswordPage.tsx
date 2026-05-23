"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@features/reset-password";

export const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  return <ResetPasswordForm token={token} />;
};
