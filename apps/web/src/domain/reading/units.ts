import {
  type QuestionGroup,
  type ReadingTest,
  STATEMENT_ANSWERS,
  groupNumbers,
} from "./content";

/**
 * How an answer is given (READING_EXPERIENCE.md, Question types (M4)):
 * choose one, choose several, choose from a list, or type words.
 */
export type UnitKind = "single" | "multi" | "select" | "text";

/**
 * One answerable thing: a question, or a "choose several" item that covers
 * several question numbers. Answers are stored under `key`, its first number.
 */
export type QuestionUnit = {
  key: string;
  numbers: number[];
  passageNumber: number;
  group: QuestionGroup;
  kind: UnitKind;
  /** The option ids a "single", "multi" or "select" answer may use. */
  optionIds: readonly string[];
  /** How many options a "multi" unit takes. */
  choose: number;
};

/** All units of a test, in question order. */
export function questionUnits(test: ReadingTest): QuestionUnit[] {
  return test.passages.flatMap((passage) =>
    passage.questionGroups.flatMap((group): QuestionUnit[] => {
      const unit = (
        numbers: number[],
        kind: UnitKind,
        optionIds: readonly string[] = [],
        choose = 1,
      ): QuestionUnit => ({
        key: String(numbers[0]),
        numbers,
        passageNumber: passage.number,
        group,
        kind,
        optionIds,
        choose,
      });
      switch (group.type) {
        case "trueFalseNotGiven":
        case "yesNoNotGiven":
          return group.questions.map((q) =>
            unit([q.number], "single", STATEMENT_ANSWERS[group.type]),
          );
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
        case "matchingInformation": {
          const letters = passage.paragraphs.flatMap((p) =>
            p.letter ? [p.letter] : [],
          );
          return groupNumbers(group).map((n) => unit([n], "select", letters));
        }
        case "matchingHeadings":
        case "matchingFeatures":
        case "matchingSentenceEndings":
        case "summaryWordBox":
          return groupNumbers(group).map((n) =>
            unit(
              [n],
              "select",
              group.options.map((o) => o.id),
            ),
          );
        default:
          return groupNumbers(group).map((n) => unit([n], "text"));
      }
    }),
  );
}

/** The unit a question number belongs to. */
export function unitOf(
  units: QuestionUnit[],
  number: number,
): QuestionUnit | undefined {
  return units.find((unit) => unit.numbers.includes(number));
}
