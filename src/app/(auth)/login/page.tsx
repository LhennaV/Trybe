import type { Metadata } from "next";
import { Suspense } from "react";
import AuthScreen, { AuthHeading } from "@/components/auth/AuthScreen";
import LoginForm from "@/components/auth/LoginForm";
import LoginFormFromLink from "@/components/auth/LoginFormFromLink";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <AuthScreen>
      <AuthHeading title="Welcome back!" subtitle="Your trades and saved posts are right where you left them." />
      {/* The plain form is prerendered; the expired-link note is added in the browser. */}
      <Suspense fallback={<LoginForm />}>
        <LoginFormFromLink />
      </Suspense>
    </AuthScreen>
  );
}
