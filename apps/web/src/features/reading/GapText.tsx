import type { GapSegment } from "@/domain/reading/content";

/**
 * Test text with numbered gaps, e.g. "… on (27) ______ buildings …". The
 * current gap is marked, and a gap shows its answer once there is one.
 */
export function GapText({
  segments,
  current,
  answerOf,
}: {
  segments: GapSegment[];
  current: number;
  answerOf: (number: number) => string | undefined;
}) {
  return (
    <>
      {segments.map((segment, i) => {
        if ("text" in segment) return <span key={i}>{segment.text}</span>;
        const answer = answerOf(segment.gap);
        const isCurrent = segment.gap === current;
        return (
          <span
            key={i}
            aria-current={isCurrent ? "true" : undefined}
            className={`inline-block rounded-sm px-1 ${isCurrent ? "bg-brand-blush" : ""}`}
          >
            <span className="font-bold">({segment.gap})</span>{" "}
            <span className="inline-block min-w-[6ch] border-b-2 border-ink">
              {answer ?? " "}
            </span>
          </span>
        );
      })}
    </>
  );
}
