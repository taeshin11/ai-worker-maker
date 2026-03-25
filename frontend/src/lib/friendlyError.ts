import type { Dict } from "./i18n/en";

const ERROR_CODES = [
  "overloaded",
  "rate_limit",
  "invalid_key",
  "no_key",
  "api_error",
  "unknown",
] as const;

type ErrorCode = (typeof ERROR_CODES)[number];

/** Extract an error code from a stream chunk, HTTP response, or raw string. */
export function parseErrorCode(text: string): ErrorCode | null {
  // Stream sentinel: __ERROR__:code
  const sentinel = text.match(/__ERROR__:(\w+)/);
  if (sentinel) return normalizeCode(sentinel[1]);

  // JSON response body: {"code":"overloaded"}
  try {
    const json = JSON.parse(text);
    if (json?.code) return normalizeCode(json.code);
    if (json?.error?.type) return normalizeCode(json.error.type);
  } catch {
    // not JSON
  }

  // Legacy "[Error: ...]" format — extract type if present
  if (text.includes("overloaded")) return "overloaded";
  if (text.includes("rate_limit") || text.includes("429")) return "rate_limit";
  if (text.includes("authentication") || text.includes("401")) return "invalid_key";

  return null;
}

function normalizeCode(raw: string): ErrorCode {
  if (raw === "overloaded_error" || raw === "overloaded") return "overloaded";
  if (raw === "rate_limit_error" || raw === "rate_limit") return "rate_limit";
  if (raw === "invalid_key" || raw === "authentication_error") return "invalid_key";
  if (raw === "no_key") return "no_key";
  if (ERROR_CODES.includes(raw as ErrorCode)) return raw as ErrorCode;
  return "api_error";
}

/** Get a friendly, localized message for an error code. */
export function friendlyMessage(code: ErrorCode | null, t: Dict): string {
  if (!code) return t.errors.unknown;
  return t.errors[code] ?? t.errors.unknown;
}
