"use client";

import { LoginForm } from "@features/login";
import { routes } from "@ross2p/shared";

export const LoginPage = () => (
  <div>
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Welcome back
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Sign in to continue to Mindlet
      </p>
    </div>

    <LoginForm />

    <div className="animate-field animate-field-5 mt-6">
      <div className="relative flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t border-border" />
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <a
          href={routes.registration}
          className="font-medium text-primary hover:text-primary-dark transition-colors underline-offset-4 hover:underline"
        >
          Create one
        </a>
      </p>
    </div>
  </div>
);
