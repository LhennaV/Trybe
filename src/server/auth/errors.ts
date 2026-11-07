import { isAuthError } from "@supabase/supabase-js";
import { AppError } from "@/server/errors";

// Supabase Auth error codes we expect, mapped to our API errors. Anything
// else is passed through and becomes INTERNAL_ERROR (and goes to Sentry).
// https://supabase.com/docs/guides/auth/debugging/error-codes
export function toAuthAppError(error: unknown): unknown {
  if (!isAuthError(error)) return error;

  switch (error.code) {
    case "captcha_failed":
      return new AppError("CAPTCHA_FAILED");
    case "invalid_credentials":
      return new AppError("INVALID_CREDENTIALS");
    case "email_not_confirmed":
      return new AppError("EMAIL_NOT_VERIFIED");
    case "weak_password":
      return new AppError("VALIDATION_FAILED", "Pick a stronger password.", {
        password: ["Pick a stronger password."],
      });
    case "same_password":
      return new AppError("VALIDATION_FAILED", "Pick a password you haven't used here.", {
        password: ["Pick a password you haven't used here."],
      });
    case "email_address_invalid":
      return new AppError("VALIDATION_FAILED", "Enter a valid email.", { email: ["Enter a valid email."] });
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return new AppError("RATE_LIMITED");
    default:
      return error;
  }
}
