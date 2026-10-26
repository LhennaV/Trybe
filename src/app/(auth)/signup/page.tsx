import type { Metadata } from "next";
import AuthScreen, { AuthHeading } from "@/components/auth/AuthScreen";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function SignupPage() {
  return (
    <AuthScreen backHref="/welcome">
      <AuthHeading
        title="Join the Trybe"
        subtitle="Bring the gear you're done with. Leave with something new to try."
      />
      <SignupForm />
    </AuthScreen>
  );
}
