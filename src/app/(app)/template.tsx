// Remounts on every tab change, so each screen cross-fades in.
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
