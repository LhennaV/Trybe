import Image from "next/image";

// Storm, the TRYBE wordmark, and the tagline. The tagline is real text, not part
// of the image, so its color follows the theme.
export default function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={["flex flex-col items-center gap-2", className].filter(Boolean).join(" ")}>
      <Image src="/brand/storm-logo.png" alt="Trybe" width={244} height={234} priority />
      <p className="text-center text-body-m text-brand-plum-dark">
        Curiosity killed the cat.
        <br />
        <strong className="font-extrabold">Trybe</strong> brought it back.
      </p>
    </div>
  );
}
