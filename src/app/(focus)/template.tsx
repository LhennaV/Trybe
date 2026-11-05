// Remounts on every navigation, so each full-screen view fades in. Keeps the
// layout's flex column so pages can still grow to fill the screen.
export default function FocusTemplate({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 animate-fade-in flex-col">{children}</div>;
}
