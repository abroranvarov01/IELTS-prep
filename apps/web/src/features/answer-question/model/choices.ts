import {
  type Option,
  type QuestionUnit,
  type ReadingTest,
  STATEMENT_ANSWERS,
} from "@/entities/reading";
import { listOptions } from "./matching";

/** A "choose one" question's prompt and options; `letter` says whether the option id is shown before its text. */
export function choices(unit: QuestionUnit, number: number) {
  const group = unit.group;
  switch (group.type) {
    case "trueFalseNotGiven":
    case "yesNoNotGiven":
      return {
        prompt:
          group.questions.find((q) => q.number === number)?.statement ?? "",
        options: STATEMENT_ANSWERS[group.type].map((id) => ({
          id,
          text: id,
          letter: false,
        })),
      };
    case "multipleChoice": {
      const question = group.questions.find((q) => q.number === number);
      return {
        prompt: question?.stem ?? "",
        options: (question?.options ?? []).map((o) => ({ ...o, letter: true })),
      };
    }
    default:
      return { prompt: "", options: [] };
  }
}

/** The "choose several" item a unit answers. */
export function multiItem(unit: QuestionUnit) {
  return unit.group.type === "multipleChoiceMulti"
    ? unit.group.items.find((i) => i.numbers.includes(unit.numbers[0] ?? 0))
    : undefined;
}

/** Every option a choice or list unit offers, in the test's order; none for typed answers. */
export function unitOptions(test: ReadingTest, unit: QuestionUnit): Option[] {
  switch (unit.kind) {
    case "single":
      return choices(unit, unit.numbers[0] ?? 0).options.map(
        ({ id, text }) => ({ id, text }),
      );
    case "multi":
      return multiItem(unit)?.options ?? [];
    case "select":
      return listOptions(test, unit);
    case "text":
      return [];
  }
}
