import { Check, Circle } from "@phosphor-icons/react";
import { PASSWORD_RULES } from "./signupChecks";

// The password rules, ticking off as you type. Each rule has text and an icon,
// never color alone. `showMissing` turns unmet rules red after a submit try.
export default function PasswordChecklist({
  id,
  password,
  showMissing = false,
}: {
  id?: string;
  password: string;
  showMissing?: boolean;
}) {
  return (
    <ul id={id} className="grid grid-cols-1 gap-x-3 gap-y-1 sm:grid-cols-2" aria-label="Password needs">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.id}
            className={`flex items-center gap-1.5 text-caption ${
              met ? "font-bold text-status-success" : showMissing ? "font-bold text-status-danger" : "text-ink-600"
            }`}
          >
            {met ? (
              <Check size={14} weight="bold" aria-hidden className="shrink-0" />
            ) : (
              <Circle size={14} weight="bold" aria-hidden className="shrink-0" />
            )}
            {rule.label}
            <span className="sr-only">{met ? ", done" : ", still needed"}</span>
          </li>
        );
      })}
    </ul>
  );
}
