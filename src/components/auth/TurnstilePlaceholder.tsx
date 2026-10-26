import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

// Stand-in for the Cloudflare Turnstile widget (AUTH-02), same size and frame
// as the Figma design. The real widget needs the site key and the backend
// check, so it gets swapped in when sign up is wired to the API.
export default function TurnstilePlaceholder() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-line bg-surface-white px-3.5 py-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-chip bg-line text-ink-600">
        <ShieldCheck size={14} weight="bold" aria-hidden />
      </span>
      <p className="text-body-s font-bold text-ink-600">Bot check goes here</p>
      <p className="ml-auto text-right text-caption text-ink-400">
        Turnstile
        <br />
        bot check
      </p>
    </div>
  );
}
