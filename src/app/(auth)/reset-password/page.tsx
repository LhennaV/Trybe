import type { Metadata } from "next";
import AuthScreen, { AuthHeading } from "@/components/auth/AuthScreen";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Pick a new password",
  robots: { index: false },
};

// AUTH_REDIRECTS.recovery: where the password reset email lands.
export default function ResetPasswordPage() {
  return (
    <AuthScreen>
      <AuthHeading
        title="Pick a new password"
        subtitle="Make it one you haven't used here before. Your cat won't tell anyone."
      />
      <ResetPasswordForm />
    </AuthScreen>
  );
}
