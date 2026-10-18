// The device's localStorage, shared by the Reading and Listening sessions
// (ADR-0006, ADR-0013 §3).

export type KeyValueStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** The browser's localStorage, or undefined where it is blocked. */
export function deviceStorage(): KeyValueStore | undefined {
  try {
    return window.localStorage;
  } catch {
    // Some browsers throw on access when site data is blocked.
    return undefined;
  }
}

/**
 * A new session id (ADR-0009 §3): "s-" and a random version 4 UUID. Built
 * from `crypto.getRandomValues`, which, unlike `randomUUID`, also works
 * outside secure contexts.
 */
export function newSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `s-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
