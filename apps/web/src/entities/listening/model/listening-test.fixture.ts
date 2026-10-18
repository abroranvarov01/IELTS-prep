// A small, original Listening test for unit tests: 4 parts of 10 questions
// covering every question type and answer kind of ADR-0012, with a 3-second
// generated tone as every part's audio (testing/media). Returned as fresh
// JSON so a test can break one field at a time.

const AUDIO = {
  src: "tone.6ffd8c74b928.m4a",
  mimeType: "audio/mp4",
  durationMs: 3000,
  bytes: 13633,
  sha256: "6ffd8c74b928e98560457c5f25b3e19cbdd7951f02744fcf97ee91955924a6b8",
  provenance: {
    producedBy: "IELTS Prep tests",
    method: "synthetic",
    tool: "ffmpeg sine generator",
    voices: [{ role: "Tone", accent: "None" }],
    license: "Original test fixture",
    producedAt: "2026-10-18",
  },
};

const IMAGE = {
  src: "plan.8442559a94d7.svg",
  mimeType: "image/svg+xml",
  width: 400,
  height: 300,
  alt: "Plan of a small building",
  description:
    "A rectangle divided into four rooms. The entrance is in the top-left room.",
  bytes: 345,
  sha256: "8442559a94d7a1120e476efcfcb3b8199ecac02233e1eb8b359342a45d4893c9",
  provenance: {
    producedBy: "IELTS Prep tests",
    method: "drawn",
    license: "Original test fixture",
    producedAt: "2026-10-18",
  },
};

const typed = (words = 2) => ({
  kind: "typed",
  wordLimit: { words, numbers: true },
});
const choose = (ids: string[]) => ({
  kind: "choose",
  options: ids.map((id) => ({ id, text: `Option ${id}` })),
  allowRepeat: false,
});
const abc = [
  { id: "A", text: "First" },
  { id: "B", text: "Second" },
  { id: "C", text: "Third" },
];
const gap = (n: number) => [{ text: "Answer " }, { gap: n }];

export function fixtureTest() {
  return structuredClone({
    id: "fixture-listening",
    version: 1,
    title: "Fixture Listening Test",
    origin: { kind: "original", author: "IELTS Prep tests" },
    parts: [
      {
        id: "p1",
        number: 1,
        audio: AUDIO,
        questionGroups: [
          {
            id: "p1-form",
            type: "formCompletion",
            instruction: "Complete the form.",
            title: "Booking form",
            lines: [
              { label: "Example", value: [{ text: "Given" }] },
              ...[1, 2, 3, 4].map((n) => ({
                label: `Field ${n}`,
                value: gap(n),
              })),
            ],
            answer: typed(),
          },
          {
            id: "p1-notes",
            type: "noteCompletion",
            instruction: "Complete the notes.",
            lines: [{ heading: "Notes" }, gap(5), gap(6), gap(7)],
            answer: choose(["A", "B", "C", "D"]),
          },
          {
            id: "p1-mc",
            type: "multipleChoice",
            instruction: "Choose the correct letter.",
            questions: [8, 9, 10].map((number) => ({
              number,
              stem: `Question ${number}`,
              options: abc,
            })),
          },
        ],
      },
      {
        id: "p2",
        number: 2,
        audio: AUDIO,
        questionGroups: [
          {
            id: "p2-table",
            type: "tableCompletion",
            instruction: "Complete the table.",
            columns: ["Place", "Open", "Note"],
            rowHeaders: true,
            rows: [
              { cells: [[{ text: "Library" }], gap(11), gap(12)] },
              { cells: [[{ text: "Pool" }], gap(13), gap(14)] },
            ],
            answer: typed(),
          },
          {
            id: "p2-flow",
            type: "flowChartCompletion",
            instruction: "Complete the flow chart.",
            steps: [[gap(15)], [gap(16)], [gap(17)]],
            answer: choose(["A", "B", "C", "D"]),
          },
          {
            id: "p2-map",
            type: "labelling",
            instruction: "Label the plan. Choose the correct letter.",
            image: IMAGE,
            markers: ["A", "B", "C", "D"].map((letter, i) => ({
              id: `p2-m-${letter.toLowerCase()}`,
              label: letter,
              x: 20 + i * 20,
              y: 50,
              option: letter,
            })),
            questions: [18, 19, 20].map((number) => ({
              number,
              prompt: `Room ${number}`,
            })),
            answer: { kind: "marker", allowRepeat: false },
          },
        ],
      },
      {
        id: "p3",
        number: 3,
        audio: AUDIO,
        questionGroups: [
          {
            id: "p3-multi",
            type: "multipleChoiceMulti",
            instruction: "Choose TWO letters.",
            items: [
              {
                numbers: [21, 22],
                stem: "Which two?",
                options: [...abc, { id: "D", text: "Fourth" }],
              },
            ],
          },
          {
            id: "p3-match",
            type: "matchingFeatures",
            instruction: "Choose the correct letter.",
            options: abc,
            allowRepeat: true,
            questions: [23, 24, 25, 26].map((number) => ({
              number,
              statement: `Item ${number}`,
            })),
          },
          {
            id: "p3-sentences",
            type: "sentenceCompletion",
            instruction: "Complete the sentences.",
            sentences: [27, 28, 29, 30].map(gap),
            answer: typed(1),
          },
        ],
      },
      {
        id: "p4",
        number: 4,
        audio: AUDIO,
        questionGroups: [
          {
            id: "p4-diagram",
            type: "labelling",
            instruction: "Label the diagram.",
            image: IMAGE,
            markers: [31, 32, 33].map((question, i) => ({
              id: `p4-m-${question}`,
              label: String(question),
              x: 10 + i * 30,
              y: 20,
              question,
            })),
            questions: [31, 32, 33].map((number) => ({ number })),
            answer: typed(),
          },
          {
            id: "p4-words",
            type: "labelling",
            instruction: "Label the plan. Choose from the list.",
            image: IMAGE,
            markers: [34, 35].map((question, i) => ({
              id: `p4-w-${question}`,
              label: String(question),
              x: 40 + i * 20,
              y: 80,
              question,
            })),
            questions: [34, 35].map((number) => ({ number })),
            answer: choose(["A", "B", "C"]),
          },
          {
            id: "p4-short",
            type: "shortAnswer",
            instruction: "Answer the questions.",
            wordLimit: { words: 3, numbers: true },
            questions: [
              { number: 36, question: "What?" },
              { numbers: [37, 38], question: "List TWO things." },
              { number: 39, question: "Where?" },
              { number: 40, question: "When?" },
            ],
          },
        ],
      },
    ],
  });
}

/** Two segments per part, within the 3-second tone. */
export function fixtureTranscript() {
  return {
    testId: "fixture-listening",
    version: 1,
    revision: 1,
    review: { status: "aiDraft" },
    parts: ["p1", "p2", "p3", "p4"].map((partId) => ({
      partId,
      segments: [
        {
          id: `${partId}-s1`,
          startMs: 0,
          endMs: 1200,
          speaker: "Narrator",
          text: "You now have some time to look at the questions.",
        },
        {
          id: `${partId}-s2`,
          startMs: 1200,
          endMs: 3000,
          speaker: "Speaker",
          text: "The answer is right here.",
        },
      ],
    })),
  };
}

const OPTION_ANSWERS: Record<number, string> = {
  5: "A",
  6: "B",
  7: "C",
  8: "A",
  9: "B",
  10: "C",
  15: "A",
  16: "B",
  17: "C",
  18: "A",
  19: "B",
  20: "C",
  23: "A",
  24: "A",
  25: "B",
  26: "C",
  34: "A",
  35: "B",
};

export function fixtureKey() {
  const answers: Record<string, unknown> = {};
  for (let n = 1; n <= 40; n++) {
    const part = `p${Math.ceil(n / 10)}`;
    answers[String(n)] = {
      accept:
        n === 21 || n === 22
          ? ["A", "C"]
          : OPTION_ANSWERS[n]
            ? [OPTION_ANSWERS[n]]
            : ["right here", "here"],
      evidence: [{ segment: `${part}-s2`, quote: "right here" }],
    };
  }
  return {
    testId: "fixture-listening",
    version: 1,
    revision: 1,
    review: { status: "aiDraft" },
    answers,
  };
}
