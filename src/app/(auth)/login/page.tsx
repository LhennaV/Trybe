import type { Metadata } from "next";
import Image from "next/image";
import AuthScreen, { AuthHeading } from "@/components/auth/AuthScreen";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <AuthScreen backHref="/welcome">
      <Image src="/brand/storm-icon.png" alt="" width={82} height={80} priority />
      <AuthHeading
        title="Welcome back!"
        subtitle="Your trades and saved posts are right where you left them."
      />
      <LoginForm />
    </AuthScreen>
  );
}
