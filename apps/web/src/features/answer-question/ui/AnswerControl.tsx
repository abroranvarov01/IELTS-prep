import type { QuestionUnit } from "@/entities/reading";
import { ChoiceQuestion } from "./ChoiceQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { MultiChoiceQuestion } from "./MultiChoiceQuestion";
import { TypedQuestion } from "./TypedQuestion";

/**
 * The question's own interaction, by how it is answered (READING_EXPERIENCE.md,
 * Question types). `onChoose` opens a "choose from a list" question's option
 * list. Without `withGroupText`, the text a summary, notes or word-box group
 * shares is shown by the caller, once for all its questions (the desktop
 * question column).
 */
export function AnswerControl({
  unit,
  onChoose,
  withGroupText = true,
}: {
  unit: QuestionUnit;
  onChoose: () => void;
  withGroupText?: boolean;
}) {
  switch (unit.kind) {
    case "single":
      return <ChoiceQuestion unit={unit} />;
    case "multi":
      return <MultiChoiceQuestion unit={unit} />;
    case "select":
      return (
        <MatchingQuestion
          unit={unit}
          withGroupText={withGroupText}
          onChoose={onChoose}
        />
      );
    case "text":
      return <TypedQuestion unit={unit} withGroupText={withGroupText} />;
  }
}
