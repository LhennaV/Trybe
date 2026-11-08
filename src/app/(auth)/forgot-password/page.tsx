import type { Metadata } from "next";
import AuthScreen, { AuthHeading } from "@/components/auth/AuthScreen";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthScreen>
      <AuthHeading
        title="Forgot your password?"
        subtitle="Happens to the best of us. Drop your email and we'll send a link to pick a new one."
      />
      <ForgotPasswordForm />
    </AuthScreen>
  );
}
