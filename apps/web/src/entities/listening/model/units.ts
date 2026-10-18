import { answerOptionIds } from "@/shared/content/shapes";
import {
  type ListeningTest,
  type QuestionGroup,
  groupNumbers,
} from "./content";

/**
 * How an answer is given (LISTENING_EXPERIENCE.md, Types by interaction):
 * choose one, choose several, choose from a list, or type words. The stored
 * answers keep the Reading shapes.
 */
export type UnitKind = "single" | "multi" | "select" | "text";

/** One answerable thing; answers are stored under `key`, its first number. */
export type QuestionUnit = {
  key: string;
  numbers: number[];
  partNumber: number;
  group: QuestionGroup;
  kind: UnitKind;
  /** The option ids a "single", "multi" or "select" answer may use. */
  optionIds: readonly string[];
  /** How many options a "multi" unit takes. */
  choose: number;
};

/** All units of a test, in question order. */
export function questionUnits(test: ListeningTest): QuestionUnit[] {
  return test.parts.flatMap((part) =>
    part.questionGroups.flatMap((group): QuestionUnit[] => {
      const unit = (
        numbers: number[],
        kind: UnitKind,
        optionIds: readonly string[] = [],
        choose = 1,
      ): QuestionUnit => ({
        key: String(numbers[0]),
        numbers,
        partNumber: part.number,
        group,
        kind,
        optionIds,
        choose,
      });
      switch (group.type) {
        case "multipleChoice":
          return group.questions.map((q) =>
            unit(
              [q.number],
              "single",
              q.options.map((o) => o.id),
            ),
          );
        case "multipleChoiceMulti":
          return group.items.map((item) =>
            unit(
              item.numbers,
              "multi",
              item.options.map((o) => o.id),
              item.numbers.length,
            ),
          );
        case "matchingFeatures":
          return group.questions.map((q) =>
            unit(
              [q.number],
              "select",
              group.options.map((o) => o.id),
            ),
          );
        case "shortAnswer":
          return groupNumbers(group).map((n) => unit([n], "text"));
        default: {
          const ids =
            group.type === "labelling"
              ? answerOptionIds(group.answer, group.markers)
              : answerOptionIds(group.answer);
          return groupNumbers(group).map((n) =>
            ids ? unit([n], "select", ids) : unit([n], "text"),
          );
        }
      }
    }),
  );
}

export function unitOf(
  units: QuestionUnit[],
  number: number,
): QuestionUnit | undefined {
  return units.find((unit) => unit.numbers.includes(number));
}
