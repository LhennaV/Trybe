import Sidebar from "@/components/shell/Sidebar";

// Screens that take over the whole phone screen (post detail, trade chat,
// settings, forms). No bottom nav on mobile; the sidebar still shows from lg up.
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Sidebar />
      <div className="flex flex-1 flex-col lg:pl-64">{children}</div>
    </>
  );
}
