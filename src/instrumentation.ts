import * as Sentry from "@sentry/nextjs";

// Server and edge error tracking. Does nothing until SENTRY_DSN is set.
export function register() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: Boolean(process.env.SENTRY_DSN),
    environment: process.env.VERCEL_ENV ?? "development",
    tracesSampleRate: 0.1,
    // Collect only what we need (TRD section 15). Errors and stack traces only:
    // no cookies or headers (session tokens), no bodies (passwords, chat
    // messages), no query data or local variables (user data).
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
    },
  });
}

// Reports errors thrown while rendering or in route handlers that nothing caught.
export const onRequestError = Sentry.captureRequestError;
