type ComingSoonProps = {
  title: string;
  children: React.ReactNode;
};

// Placeholder screen body until each page is built for real.
export default function ComingSoon({ title, children }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-display text-display-l text-ink-900">{title}</h1>
      <p className="max-w-md text-body-m text-ink-600">{children}</p>
    </div>
  );
}
