"use client";

import { LoginForm } from "@features/auth";
import { Card, CardContent } from "@ross2p/shared";

export const Login = () => {
  return (
    <Card className="flex justify-center items-center h-screen" padding="lg">
      <CardContent>
        <LoginForm />
      </CardContent>
      {/* <Divider />  */}
    </Card>
  );
};
