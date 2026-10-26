import SettingsNav from "@/components/settings/SettingsNav";

// Mobile: each settings screen is full width. Desktop: settings menu on the
// left, the screen on the right.
export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="lg:mx-auto lg:grid lg:w-full lg:max-w-[1040px] lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:pt-7">
      <SettingsNav />
      <div className="flex flex-col lg:[&>main]:mx-0 lg:[&>main]:max-w-[560px] lg:[&>main]:px-0">{children}</div>
    </div>
  );
}
