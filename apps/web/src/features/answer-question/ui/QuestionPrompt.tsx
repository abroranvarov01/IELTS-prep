import { useTranslations } from "next-intl";
import type { QuestionUnit, ReadingTest } from "@/entities/reading";
import { choices, multiItem } from "../model/choices";
import { matchingPrompt } from "../model/matching";
import { GapText } from "./GapText";
import { GroupTextView, hasGroupText } from "./GroupText";

const noAnswer = () => undefined;

/**
 * What a question asks, as in the test and without its answer control or any
 * answer (review, READING_EXPERIENCE.md, Evidence-first review): the
 * statement or stem, the matching prompt, or the text with its numbered gaps
 * and this question's gap marked.
 */
export function QuestionPrompt({
  test,
  unit,
}: {
  test: ReadingTest;
  unit: QuestionUnit;
}) {
  const t = useTranslations("reading");
  const number = unit.numbers[0] ?? 0;
  const group = unit.group;

  if (hasGroupText(group))
    return (
      <GroupTextView
        group={group}
        current={number}
        answerOf={noAnswer}
        testId={test.id}
      />
    );
  switch (unit.kind) {
    case "single":
      return (
        <p lang="en" className="font-bold">
          {choices(unit, number).prompt}
        </p>
      );
    case "multi":
      return (
        <p lang="en" className="font-bold">
          {multiItem(unit)?.stem}
        </p>
      );
    case "select": {
      const prompt = matchingPrompt(test, unit, number);
      if (prompt.kind === "paragraph")
        return (
          <p className="font-bold">
            {t("evidence.paragraph", { letter: prompt.letter })}
          </p>
        );
      return (
        <p lang="en" className="font-bold">
          {prompt.kind === "text" ? prompt.text : null}
        </p>
      );
    }
    case "text":
      if (group.type === "sentenceCompletion")
        return (
          <p lang="en">
            <GapText
              segments={
                group.sentences.find((s) =>
                  s.some(
                    (segment) => "gap" in segment && segment.gap === number,
                  ),
                ) ?? []
              }
              current={number}
              answerOf={noAnswer}
            />
          </p>
        );
      return (
        <p lang="en" className="font-bold">
          {group.type === "shortAnswer"
            ? group.questions.find((q) => q.number === number)?.question
            : null}
        </p>
      );
  }
}
