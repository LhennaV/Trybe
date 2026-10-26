import type { Metadata } from "next";
import AuthScreen, { AuthHeading } from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Forgot password",
};

// Placeholder until the reset flow is designed and the accounts API exists.
export default function ForgotPasswordPage() {
  return (
    <AuthScreen backHref="/login">
      <AuthHeading
        title="Forgot your password?"
        subtitle="Happens to the best of us. Password resets are coming soon."
      />
    </AuthScreen>
  );
}
