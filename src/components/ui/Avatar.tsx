import Image from "next/image";

type AvatarProps = {
  // Display name or handle. Used for the alt text, the initial, and the fallback color.
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
};

const fallbackColors = ["bg-brand-blush", "bg-brand-box", "bg-brand-lavender"];

// Same name, same color, so a person keeps their color across the app.
function colorFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return fallbackColors[hash % fallbackColors.length];
}

export default function Avatar({ name, src, size = 40, className }: AvatarProps) {
  const base = ["relative shrink-0 overflow-hidden rounded-chip", className].filter(Boolean).join(" ");

  if (src) {
    return (
      <span className={base} style={{ width: size, height: size }}>
        <Image src={src} alt={name} fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }

  // Small avatars (like the 20px ones on feed cards) are just a color dot, as in Figma.
  const showInitial = size >= 32;
  return (
    <span
      className={`${base} flex items-center justify-center font-extrabold text-ink-900 ${colorFor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      role={showInitial ? "img" : undefined}
      aria-label={showInitial ? name : undefined}
      aria-hidden={showInitial ? undefined : true}
    >
      {showInitial && name.replace(/^@/, "").charAt(0).toUpperCase()}
    </span>
  );
}
