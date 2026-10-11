import type { WordLimit } from "./content";

/**
 * Whether a typed answer has more words than its instruction allows, for the
 * Practice warning (READING_EXPERIENCE.md, Practice and Exam Mode). A word is
 * a space-separated part with a letter in it; a number is never counted, so
 * the warning only appears when the answer is too long in any reading of the
 * limit. Answer checking (M5) needs the official counting rules.
 */
export function exceedsWordLimit(answer: string, limit: WordLimit): boolean {
  const words = answer.split(/\s+/).filter((part) => /\p{L}/u.test(part));
  return words.length > limit.words;
}
