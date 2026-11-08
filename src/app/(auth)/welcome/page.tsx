import { redirect } from "next/navigation";

// The landing page now has Log in and Sign up in its top bar, so this extra
// "pick one" screen only added a step. Old links still work.
export default function WelcomePage() {
  redirect("/");
}
