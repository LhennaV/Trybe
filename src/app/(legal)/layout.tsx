import LandingFooter from "@/components/landing/LandingFooter";
import LandingNav from "@/components/landing/LandingNav";

// Terms, Privacy, and Community Guidelines. Public pages that anyone can open
// from the store listing or a link, signed in or not, so they use the landing
// page's nav and footer instead of the app shell.
export default function LegalLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <LandingNav />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </>
  );
}
