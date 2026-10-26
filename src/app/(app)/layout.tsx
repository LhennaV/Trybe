import BottomNav from "@/components/shell/BottomNav";
import Sidebar from "@/components/shell/Sidebar";

// Shell for the signed-in app: bottom nav on mobile, sidebar from lg up.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Sidebar />
      <main className="flex-1 px-4 pt-1.5 pb-[calc(62px+max(24px,env(safe-area-inset-bottom))+24px)] lg:pl-[calc(16rem+40px)] lg:pr-10 lg:pt-7 lg:pb-10">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
