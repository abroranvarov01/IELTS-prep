"use client";

import type { QuestionGroup } from "@/domain/reading/content";
import { GapText } from "./GapText";
import { useReading } from "./reading-context";

/**
 * The text a summary, notes or word-box group shares between its questions,
 * with numbered gaps: the current one marked, each showing its answer once
 * there is one. Other groups have no shared text.
 */
export function GroupText({
  group,
  current,
}: {
  group: QuestionGroup;
  current: number;
}) {
  const { session } = useReading();
  const answerOf = (gap: number) => {
    const answer = session.answers[String(gap)];
    if (typeof answer !== "string") return undefined;
    if (group.type === "summaryWordBox")
      return group.options.find((o) => o.id === answer)?.text;
    return answer.trim() !== "" ? answer : undefined;
  };
  if (
    group.type !== "summaryCompletion" &&
    group.type !== "summaryWordBox" &&
    group.type !== "noteCompletion"
  )
    return null;

  return (
    <div lang="en">
      {group.title && <p className="font-bold">{group.title}</p>}
      {group.type === "noteCompletion" ? (
        <ul className="mt-1 flex flex-col gap-1">
          {group.lines.map((line, i) => (
            <li key={i}>
              <GapText segments={line} current={current} answerOf={answerOf} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={group.title ? "mt-1" : undefined}>
          <GapText
            segments={group.text}
            current={current}
            answerOf={answerOf}
          />
        </p>
      )}
    </div>
  );
}
