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

/**
 * Whether an answer fits its instruction's word limit, counted as the answer
 * key's validator counts (ADR-0008 §3). Every space-separated part is a word, so a hyphenated word is one
 * ("Hyphenated words such as 'check-in' count as single words": ielts.org
 * Reading format pages). Where the limit allows "AND/OR A NUMBER", one part
 * written in figures is that number. Articles count as words: no official
 * source says whether they do (owner decision D4).
 */
export function fitsWordLimit(answer: string, limit: WordLimit): boolean {
  const parts = answer.trim().split(/\s+/).filter(Boolean);
  const hasNumber = limit.numbers && parts.some(isNumberInFigures);
  return parts.length - (hasNumber ? 1 : 0) <= limit.words;
}

function isNumberInFigures(part: string): boolean {
  return /^\d+([.,]\d+)*$/.test(part);
}
