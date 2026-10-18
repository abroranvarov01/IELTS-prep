import type { WordLimit } from "@/shared/content/types";

/**
 * Whether a typed Listening answer fits its instruction's word limit
 * (LISTENING_EXPERIENCE.md, Answer checking (M9); ADR-0014 §6). Every
 * space-separated part is a word, so a hyphenated word is one ("Hyphenated
 * words such as 'check-in' count as single words": ielts.org Listening
 * format). Articles count as words (owner decision D4, product policy).
 * Where the limit allows "AND/OR A NUMBER", one number part is that number.
 */
export function fitsListeningWordLimit(
  answer: string,
  limit: WordLimit,
): boolean {
  const parts = answer.trim().split(/\s+/).filter(Boolean);
  const hasNumber = limit.numbers && parts.some(isNumberPart);
  return parts.length - (hasNumber ? 1 : 0) <= limit.words;
}

/**
 * A number part (owner decision LD5): digits, with one leading currency
 * symbol and the separators / . : , between digits. A numeric date such as
 * "19/02" counts as one word (IDP, "How to write the date correctly"); times,
 * prices, decimals and thousands follow the same rule as product policy.
 * A unit written after a number ("5 kg") is a word of its own.
 */
export function isNumberPart(part: string): boolean {
  return /^[$£€]?\d+([/.:,]\d+)*$/.test(part);
}
