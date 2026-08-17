"use client";

import { RegistrationForm } from "@features/registration";
import { routes } from "@ross2p/shared";

export const RegistrationPage = () => (
  <div>
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Create account
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Join Mindlet and start learning smarter
      </p>
    </div>

    <RegistrationForm />

    <p className="animate-field animate-field-5 mt-6 text-center text-sm text-muted-foreground">
      Already have an account?{" "}
      <a
        href={routes.login}
        className="font-medium text-primary hover:text-primary-dark transition-colors underline-offset-4 hover:underline"
      >
        Sign in
      </a>
    </p>
  </div>
);
