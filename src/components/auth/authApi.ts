import type { EmailRequest, LogIn, NewPassword, SignUp } from "@/shared/contracts/auth";
import { apiRequest } from "@/components/api/request";

// Account endpoints (TRD section 8.1). Plain functions so the forms stay thin.

type SessionUser = { id: string; email: string; emailVerified: boolean };

export function signUp(input: SignUp) {
  return apiRequest<{ email: string; needsVerification: true }>("/api/auth/signup", { body: input });
}

export function logIn(input: LogIn) {
  return apiRequest<SessionUser>("/api/auth/login", { body: input });
}

export function logOut() {
  return apiRequest<{ loggedOut: true }>("/api/auth/logout", { body: {} });
}

export function requestPasswordReset(input: EmailRequest) {
  return apiRequest<{ sent: true }>("/api/auth/password/forgot", { body: input });
}

export function resendVerification(input: EmailRequest) {
  return apiRequest<{ sent: true }>("/api/auth/verify/resend", { body: input });
}

// Needs the session the reset link created (AUTH_REDIRECTS.recovery).
export function setNewPassword(input: NewPassword) {
  return apiRequest<{ updated: true }>("/api/auth/password", { body: input });
}
