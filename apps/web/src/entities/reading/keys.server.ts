// Server-only entry point: the answer keys, for the results and review routes
// only; the test route never imports it (ADR-0008 §2, ADR-0010).
export { readingKey } from "./api/keys.server";
