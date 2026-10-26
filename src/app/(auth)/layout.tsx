import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

// Welcome, sign up, log in, and onboarding. Desktop splits the screen:
// brand panel on the left, the screen itself on the right.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col lg:grid lg:min-h-dvh lg:grid-cols-2">
      <AuthBrandPanel />
      <div className="flex flex-1 flex-col lg:justify-center">{children}</div>
    </div>
  );
}
