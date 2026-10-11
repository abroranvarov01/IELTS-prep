import type {
  Option,
  QuestionUnit,
  ReadingSession,
  ReadingTest,
} from "@/entities/reading";

/** The options of a "choose from a list" question (matching info: the passage's letters). */
export function listOptions(test: ReadingTest, unit: QuestionUnit): Option[] {
  const group = unit.group;
  if (group.type === "matchingInformation") {
    const passage = test.passages.find((p) => p.number === unit.passageNumber);
    return (passage?.paragraphs ?? []).flatMap((p) =>
      p.letter ? [{ id: p.letter, text: "" }] : [],
    );
  }
  return "options" in group ? group.options : [];
}

/** Which other questions of the same group already use each option (the user's own answers). */
export function chosenElsewhere(
  session: ReadingSession,
  units: QuestionUnit[],
  unit: QuestionUnit,
): Map<string, number[]> {
  const used = new Map<string, number[]>();
  for (const other of units) {
    if (other.group !== unit.group || other.key === unit.key) continue;
    const answer = session.answers[other.key];
    if (typeof answer !== "string") continue;
    used.set(answer, [...(used.get(answer) ?? []), other.numbers[0] ?? 0]);
  }
  return used;
}

/** What a "choose from a list" question asks about. */
export type MatchingPrompt =
  | { kind: "paragraph"; letter: string }
  | { kind: "text"; text: string }
  | { kind: "gap" };

export function matchingPrompt(
  test: ReadingTest,
  unit: QuestionUnit,
  number: number,
): MatchingPrompt {
  const group = unit.group;
  switch (group.type) {
    case "matchingHeadings": {
      const paragraphId = group.questions.find(
        (q) => q.number === number,
      )?.paragraphId;
      const passage = test.passages.find(
        (p) => p.number === unit.passageNumber,
      );
      return {
        kind: "paragraph",
        letter:
          passage?.paragraphs.find((p) => p.id === paragraphId)?.letter ?? "",
      };
    }
    case "matchingInformation":
    case "matchingFeatures":
      return {
        kind: "text",
        text: group.questions.find((q) => q.number === number)?.statement ?? "",
      };
    case "matchingSentenceEndings":
      return {
        kind: "text",
        text: `${group.questions.find((q) => q.number === number)?.start ?? ""} …`,
      };
    default:
      return { kind: "gap" };
  }
}
