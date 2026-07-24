"use client";

import { LoginForm } from "@features/auth";
import { Card } from "@ross2p/shared";

export const Login = () => {
  return (
    <Card
      variant="borderless"
      className="flex h-screen items-center justify-center p-8"
    >
      <LoginForm />
    </Card>
  );
};
