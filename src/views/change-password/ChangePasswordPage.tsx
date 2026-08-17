"use client";

import { ChangePasswordForm } from "@features/change-password";

export const ChangePasswordPage = () => (
  <div>
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Change password
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Confirm your current password. All sessions will be signed out.
      </p>
    </div>

    <ChangePasswordForm />
  </div>
);
