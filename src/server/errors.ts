import { ERROR_MESSAGES, type ErrorCode } from "@/shared/contracts/common";

// Throw this from server code to send a known error to the client.
// The route wrapper turns it into { error: { code, message } } with the right status.
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly fields?: Record<string, string[]>;

  constructor(code: ErrorCode, message: string = ERROR_MESSAGES[code], fields?: Record<string, string[]>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.fields = fields;
  }
}
