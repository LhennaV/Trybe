import type { Metadata } from "next";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create an account",
};

// Step 1 and 2 of sign up. SignupForm draws its own step frame because it
// switches to "Check your email" after the account is created.
export default function SignupPage() {
  return <SignupForm />;
}
