import SettingsNav from "@/components/settings/SettingsNav";

// Mobile: each settings screen is full width with a back button. Desktop:
// settings menu on the left, the screen on the right, lined up with the rest
// of the app (28px top, 40px sides). The menu replaces the back button there,
// and the screen title grows to match the "Settings" heading.
export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="lg:grid lg:w-full lg:max-w-[1000px] lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:px-10 lg:pt-7 lg:pb-10">
      <SettingsNav />
      <div
        className={[
          "flex flex-col lg:[&>main]:mx-0 lg:[&>main]:max-w-[640px] lg:[&>main]:px-0 lg:[&>main]:pt-0",
          "lg:[&_[data-topbar-back]]:hidden lg:[&_[data-topbar-title]]:font-display lg:[&_[data-topbar-title]]:text-display-l lg:[&_[data-topbar-title]]:text-ink-900",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
