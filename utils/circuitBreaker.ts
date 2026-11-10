/**
 * Client-Side Circuit Breaker & Rate-Limit Guard
 * Prevents runaway retry loops, UI freezing, and log spam when upstream APIs
 * (such as FatSecret or Gemini) return IP restrictions (Code 21), 429 Too Many Requests,
 * or persistent 5xx gateway errors.
 */

interface BreakerState {
  failures: number;
  trippedUntil: number;
  lastErrorReason: string | null;
}

const breakers: Record<string, BreakerState> = {};

const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown

export function isCircuitBreakerOpen(key: string): { isOpen: boolean; reason?: string } {
  const breaker = breakers[key];
  if (!breaker) {
    return { isOpen: false };
  }

  const now = Date.now();
  if (breaker.trippedUntil > now) {
    const remainingSecs = Math.ceil((breaker.trippedUntil - now) / 1000);
    return {
      isOpen: true,
      reason:
        breaker.lastErrorReason ||
        `Service temporarily unavailable. Retrying allowed in ${remainingSecs}s.`,
    };
  }

  // Cooldown passed, reset
  if (breaker.trippedUntil > 0 && breaker.trippedUntil <= now) {
    breaker.failures = 0;
    breaker.trippedUntil = 0;
    breaker.lastErrorReason = null;
  }

  return { isOpen: false };
}

export function recordCircuitSuccess(key: string): void {
  if (breakers[key]) {
    breakers[key].failures = 0;
    breakers[key].trippedUntil = 0;
    breakers[key].lastErrorReason = null;
  }
}

export function recordCircuitFailure(
  key: string,
  error: any,
  options?: { failureThreshold?: number; cooldownMs?: number }
): boolean {
  const threshold = options?.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD;
  const cooldown = options?.cooldownMs ?? DEFAULT_COOLDOWN_MS;

  if (!breakers[key]) {
    breakers[key] = {
      failures: 0,
      trippedUntil: 0,
      lastErrorReason: null,
    };
  }

  const breaker = breakers[key];
  breaker.failures += 1;

  const errMsg =
    (typeof error === "string"
      ? error
      : error?.message || error?.error || error?.details || "") + "";

  const isCriticalImmediateTrip =
    errMsg.includes("code: 21") ||
    errMsg.includes("code 21") ||
    errMsg.toLowerCase().includes("invalid ip address") ||
    errMsg.toLowerCase().includes("ip restriction") ||
    errMsg.includes("429") ||
    errMsg.toLowerCase().includes("too many requests");

  if (isCriticalImmediateTrip || breaker.failures >= threshold) {
    breaker.trippedUntil = Date.now() + cooldown;
    breaker.lastErrorReason = isCriticalImmediateTrip
      ? "FatSecret upstream API blocked or rate-limited (Invalid IP/Quota). Pausing requests."
      : `Service failed ${breaker.failures} times consecutively. Cooling down for ${Math.round(
          cooldown / 1000
        )}s.`;
    console.warn(`[CircuitBreaker] Tripped for '${key}': ${breaker.lastErrorReason}`);
    return true; // Tripped
  }

  return false;
}
