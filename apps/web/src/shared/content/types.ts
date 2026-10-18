/**
 * Content shapes shared by the Reading and Listening contracts (ADR-0005,
 * ADR-0012 §7). Structure only: no product rules beyond it.
 */

/** A licensed origin may carry its source's address and the attribution its terms require (ADR-0012 §1). */
export type Origin =
  | { kind: "original"; author: string; note?: string }
  | {
      kind: "licensed";
      source: string;
      license: string;
      url?: string;
      attribution?: string;
    };

/** A lettered or numbered choice: "A", "B", … or "i", "ii", … */
export type Option = { id: string; text: string };

/** Gap texts are structured: a gap carries its question number. */
export type GapSegment = { text: string } | { gap: number };

/** "NO MORE THAN TWO WORDS AND/OR A NUMBER" is { words: 2, numbers: true }. */
export type WordLimit = { words: number; numbers: boolean };

export function gapNumbers(segments: GapSegment[]): number[] {
  return segments.flatMap((segment) => ("gap" in segment ? [segment.gap] : []));
}
