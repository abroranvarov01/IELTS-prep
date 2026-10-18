"use client";

import { type QuestionGroup, useReading } from "@/entities/reading";
import { CompletionTable } from "@/shared/ui/CompletionTable";
import { GapText } from "./GapText";

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
  return <GroupTextView group={group} current={current} answerOf={answerOf} />;
}

/** The group's text with the given answers in its gaps, without a session. */
export function GroupTextView({
  group,
  current,
  answerOf,
}: {
  group: QuestionGroup;
  current: number;
  answerOf: (number: number) => string | undefined;
}) {
  if (!hasGroupText(group)) return null;
  if (group.type === "tableCompletion")
    return (
      <div lang="en">
        {group.title && <p className="mb-2 font-bold">{group.title}</p>}
        <CompletionTable
          table={group}
          cell={(segments) => (
            <GapText
              segments={segments}
              current={current}
              answerOf={answerOf}
            />
          )}
        />
      </div>
    );

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

/** Groups whose questions share one text: summaries, notes, word boxes and tables. */
export function hasGroupText(group: QuestionGroup): group is Extract<
  QuestionGroup,
  {
    type:
      | "summaryCompletion"
      | "summaryWordBox"
      | "noteCompletion"
      | "tableCompletion";
  }
> {
  return (
    group.type === "summaryCompletion" ||
    group.type === "summaryWordBox" ||
    group.type === "noteCompletion" ||
    group.type === "tableCompletion"
  );
}
