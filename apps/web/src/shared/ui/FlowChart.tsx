import type { ReactNode } from "react";
import type { FlowChartShape } from "@/shared/content/shapes";
import type { GapSegment } from "@/shared/content/types";
import { LineIcon } from "./icons";

/**
 * Flow-chart completion, shared by Listening and Reading (DESIGN_SYSTEM.md,
 * M8): an ordered list of boxes joined by decorative arrows, the same at
 * every width. `line` renders a line's text and gaps.
 */
export function FlowChart({
  chart,
  line,
}: {
  chart: FlowChartShape;
  line: (segments: GapSegment[], key: string) => ReactNode;
}) {
  return (
    <ol className="flex flex-col items-stretch">
      {chart.steps.map((step, s) => (
        <li key={s} className="flex flex-col items-center">
          {s > 0 && (
            <span className="py-1 text-text-secondary">
              <LineIcon className="size-[1.25rem]">
                <path d="M8 2.5v10M4 9l4 4 4-4" />
              </LineIcon>
            </span>
          )}
          <div className="w-full rounded-md border border-border-subtle bg-surface-base px-4 py-3 leading-loose shadow-soft">
            {step.map((segments, l) => (
              <p key={l}>{line(segments, `${s}-${l}`)}</p>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
