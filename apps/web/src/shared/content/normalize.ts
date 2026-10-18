/**
 * The comparable form of a typed answer or an accepted variant, shared by
 * Reading and Listening checking (ADR-0008 §1, ADR-0014 §6). Mechanical
 * only: spelling, word forms and optional words are decided by the variants
 * listed in the key, never here.
 * - Letter case is ignored: "Capitalization is not important on the Reading
 *   test" (IDP, "IELTS Focus: Academic Reading", p. 44); for Listening no
 *   official source was found, so it is product policy there (owner, LD3).
 * - Surrounding and repeated spaces, typographic apostrophes and the Unicode
 *   hyphens that phone keyboards insert are not differences in the answer.
 * - One trailing full stop is ignored, because phone keyboards add one after
 *   a double space (owner decision D2; no official rule exists). Commas,
 *   semicolons, colons and every other mark are kept.
 */
export function normalizeTypedAnswer(text: string): string {
  const collapsed = text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[‐‑]/g, "-")
    .trim()
    .replace(/\s+/g, " ");
  return collapsed.endsWith(".") ? collapsed.slice(0, -1).trimEnd() : collapsed;
}
