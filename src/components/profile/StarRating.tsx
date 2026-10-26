import { Star } from "@phosphor-icons/react/dist/ssr";

// Read-only stars, e.g. on past trades. Filled stars are cardboard orange.
export default function StarRating({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          weight="fill"
          aria-hidden
          className={index < value ? "text-brand-box" : "text-line"}
        />
      ))}
    </span>
  );
}
