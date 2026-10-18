import { describe, expect, it } from "vitest";
import { groupNumbers } from "./content";
import {
  fixtureKey,
  fixtureTest,
  fixtureTranscript,
} from "./listening-test.fixture";
import {
  parseListeningKey,
  parseListeningTest,
  parseTranscript,
} from "./parse-content";

type Test = ReturnType<typeof fixtureTest>;

function testErrors(change: (test: Test) => void): string[] {
  const test = fixtureTest();
  change(test);
  const parsed = parseListeningTest(test);
  return parsed.ok ? [] : parsed.errors;
}

const group = (test: Test, part: number, index: number) =>
  test.parts[part]!.questionGroups[index] as Record<string, unknown>;

function validTest() {
  const parsed = parseListeningTest(fixtureTest());
  if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
  return parsed.value;
}

function validTranscript() {
  const parsed = parseTranscript(validTest(), fixtureTranscript());
  if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
  return parsed.value;
}

describe("a Listening test", () => {
  it("accepts a test of 4 parts and 40 questions with every question type", () => {
    const test = validTest();
    const types = new Set(
      test.parts.flatMap((p) => p.questionGroups.map((g) => g.type)),
    );
    expect(types.size).toBe(10);
    expect(
      test.parts.flatMap((p) => p.questionGroups.flatMap(groupNumbers)),
    ).toEqual(Array.from({ length: 40 }, (_, i) => i + 1));
  });

  it("rejects anything that is not an object", () => {
    expect(parseListeningTest("test")).toEqual({
      ok: false,
      errors: ["test: expected an object"],
    });
  });

  it("requires an origin (original or licensed content only)", () => {
    expect(
      testErrors((t) => delete (t as { origin?: unknown }).origin),
    ).toContainEqual(expect.stringContaining("origin: required"));
  });

  it("keeps a licensed origin's address and attribution", () => {
    const test = fixtureTest();
    Object.assign(test, {
      origin: {
        kind: "licensed",
        source: "VOA Learning English",
        license: "Public domain",
        url: "https://learningenglish.voanews.com/p/6861.html",
        attribution: "Recordings: VOA Learning English, public domain.",
      },
    });
    const parsed = parseListeningTest(test);
    expect(parsed.ok && parsed.value.origin).toMatchObject({
      url: "https://learningenglish.voanews.com/p/6861.html",
      attribution: "Recordings: VOA Learning English, public domain.",
    });
  });

  it("marks temporary content only with true", () => {
    expect(
      testErrors((t) => Object.assign(t, { temporary: false })),
    ).toContainEqual("temporary: expected true or no value");
  });

  it("requires temporary content to have a licensed origin", () => {
    expect(
      testErrors((t) => Object.assign(t, { temporary: true })),
    ).toContainEqual(expect.stringContaining("temporary: temporary content"));
  });

  it("keeps the temporary flag of licensed content", () => {
    const test = fixtureTest();
    Object.assign(test, {
      temporary: true,
      origin: { kind: "licensed", source: "S", license: "L" },
    });
    const parsed = parseListeningTest(test);
    expect(parsed.ok && parsed.value.temporary).toBe(true);
  });

  it("needs exactly 4 parts, numbered in order", () => {
    expect(testErrors((t) => t.parts.pop())).toContainEqual(
      "parts: expected 4 parts",
    );
    expect(testErrors((t) => (t.parts[1]!.number = 3))).toContainEqual(
      "parts[1].number: expected 2",
    );
  });

  it("accepts another shape, as a level-check form would have", () => {
    const test = fixtureTest();
    test.parts.splice(1);
    const parsed = parseListeningTest(test, { parts: 1, questionsPerPart: 10 });
    expect(parsed.ok ? [] : parsed.errors).toEqual([]);
  });

  it("needs 10 questions in each part and the numbers 1 to 40 in order", () => {
    const errors = testErrors((t) => t.parts[0]!.questionGroups.pop());
    expect(errors).toContainEqual("parts[0]: expected 10 questions, found 7");
    expect(errors).toContainEqual(
      expect.stringContaining("questions: numbers must run 1 to 40"),
    );
  });

  it("rejects an id used twice", () => {
    expect(testErrors((t) => (t.parts[1]!.id = "p1"))).toContainEqual(
      'parts[1].id: the id "p1" is used twice',
    );
  });

  it("rejects an unknown question type", () => {
    expect(
      testErrors((t) => Object.assign(group(t, 0, 2), { type: "essay" })),
    ).toContainEqual(
      'parts[0].questionGroups[2].type: unknown question type "essay"',
    );
  });
});

describe("a part's audio", () => {
  const audio = (t: Test) => t.parts[0]!.audio as Record<string, unknown>;

  it("must be AAC in MP4", () => {
    expect(
      testErrors((t) => (audio(t).mimeType = "audio/mpeg")),
    ).toContainEqual(
      expect.stringContaining('parts[0].audio.mimeType: expected "audio/mp4"'),
    );
  });

  it("must carry its hash in its file name", () => {
    expect(
      testErrors((t) => (audio(t).src = "tone.000000000000.m4a")),
    ).toContainEqual(
      "parts[0].audio.src: the name's hash does not match sha256",
    );
    expect(testErrors((t) => (audio(t).src = "tone.m4a"))).toContainEqual(
      expect.stringContaining("parts[0].audio.src: expected"),
    );
  });

  it("must stay under the 64 kbps ceiling", () => {
    expect(testErrors((t) => (audio(t).bytes = 30_000))).toContainEqual(
      "parts[0].audio.bytes: over the 64 kbps ceiling for its duration",
    );
  });

  it("needs its provenance, including the voices", () => {
    expect(testErrors((t) => delete audio(t).provenance)).toContainEqual(
      expect.stringContaining("parts[0].audio.provenance: required"),
    );
    expect(
      testErrors(
        (t) => delete (audio(t).provenance as Record<string, unknown>).voices,
      ),
    ).toContainEqual(
      expect.stringContaining("parts[0].audio.provenance.voices"),
    );
  });
});

describe("question groups", () => {
  it("multiple choice with several answers needs consecutive numbers and spare options", () => {
    const errors = testErrors((t) => {
      const item = (group(t, 2, 0).items as Record<string, unknown>[])[0]!;
      item.numbers = [21, 23];
      item.options = [
        { id: "A", text: "a" },
        { id: "B", text: "b" },
      ];
    });
    expect(errors).toContainEqual(
      "parts[2].questionGroups[0].items[0].numbers: must be consecutive",
    );
    expect(errors).toContainEqual(
      "parts[2].questionGroups[0].items[0].options: needs more options than answers to choose",
    );
  });

  it("matching needs to say whether a letter may be used again", () => {
    expect(testErrors((t) => delete group(t, 2, 1).allowRepeat)).toContainEqual(
      "parts[2].questionGroups[1].allowRepeat: expected true or false",
    );
  });

  it("a sentence has exactly one gap", () => {
    expect(
      testErrors(
        (t) =>
          ((group(t, 2, 2).sentences as unknown[])[0] = [{ text: "No gap" }]),
      ),
    ).toContainEqual(
      "parts[2].questionGroups[2].sentences[0]: needs exactly one gap",
    );
  });

  it("notes may have heading lines, and need a gap", () => {
    expect(
      testErrors((t) => (group(t, 0, 1).lines = [{ heading: "Only" }])),
    ).toContainEqual("parts[0].questionGroups[1].lines: have no gap");
  });

  it("a form needs a gap", () => {
    expect(
      testErrors(
        (t) =>
          (group(t, 0, 0).lines = [{ label: "A", value: [{ text: "b" }] }]),
      ),
    ).toContainEqual("parts[0].questionGroups[0].lines: have no gap");
  });

  it("a gap is typed with a word limit, or chosen from options", () => {
    expect(
      testErrors((t) => (group(t, 0, 0).answer = { kind: "spoken" })),
    ).toContainEqual(
      'parts[0].questionGroups[0].answer.kind: expected "typed" or "choose"',
    );
    expect(
      testErrors((t) => (group(t, 0, 0).answer = { kind: "typed" })),
    ).toContainEqual(
      "parts[0].questionGroups[0].answer.wordLimit: required for typed answers",
    );
  });

  it("a short-answer question has one number, or two or three", () => {
    expect(
      testErrors(
        (t) =>
          ((group(t, 3, 2).questions as Record<string, unknown>[])[1]!.numbers =
            [37, 38, 39, 40]),
      ),
    ).toContainEqual(
      "parts[3].questionGroups[2].questions[1].numbers: at most 3 answers to one question",
    );
  });

  it("a table has 2 to 4 columns, one cell per column, and a gap", () => {
    expect(
      testErrors((t) => (group(t, 1, 0).columns = ["a", "b", "c", "d", "e"])),
    ).toContainEqual(
      "parts[1].questionGroups[0].columns: at most 4 columns fit a phone",
    );
    expect(
      testErrors((t) => (group(t, 1, 0).columns = ["only"])),
    ).toContainEqual(
      expect.stringContaining(
        "parts[1].questionGroups[0].columns: expected a list with at least 2",
      ),
    );
    expect(
      testErrors(
        (t) =>
          ((group(t, 1, 0).rows as Record<string, unknown>[])[0]!.cells = [
            [{ text: "x" }],
          ]),
      ),
    ).toContainEqual(
      "parts[1].questionGroups[0].rows[0].cells: expected one cell per column (3)",
    );
  });

  it("a flow chart has 2 to 12 steps and a gap", () => {
    expect(
      testErrors((t) => (group(t, 1, 1).steps = [[[{ gap: 15 }]]])),
    ).toContainEqual(
      expect.stringContaining(
        "parts[1].questionGroups[1].steps: expected a list with at least 2",
      ),
    );
    expect(
      testErrors(
        (t) =>
          (group(t, 1, 1).steps = Array.from({ length: 13 }, () => [
            [{ text: "Step" }],
          ])),
      ),
    ).toContainEqual("parts[1].questionGroups[1].steps: at most 12 steps");
  });
});

describe("labelling", () => {
  const markers = (t: Test, part: number, index: number) =>
    group(t, part, index).markers as Record<string, unknown>[];

  it("places markers within the picture", () => {
    expect(testErrors((t) => (markers(t, 1, 2)[0]!.x = 120))).toContainEqual(
      "parts[1].questionGroups[2].markers[0].x: expected a number from 0 to 100",
    );
  });

  it("gives each marker a question number or an option, not both", () => {
    expect(
      testErrors((t) => (markers(t, 1, 2)[0]!.question = 18)),
    ).toContainEqual(
      "parts[1].questionGroups[2].markers[0]: expected a question number or an option, not both",
    );
  });

  it("with letters on the picture, the letters are unique and every question names its place", () => {
    const errors = testErrors((t) => {
      markers(t, 1, 2)[1]!.option = "A";
      delete (group(t, 1, 2).questions as Record<string, unknown>[])[0]!.prompt;
    });
    expect(errors).toContainEqual(
      "parts[1].questionGroups[2].markers: option letters must be unique",
    );
    expect(errors).toContainEqual(
      "parts[1].questionGroups[2].questions[0].prompt: required when the picture shows letters",
    );
  });

  it("with numbers on the picture, each question has exactly one marker", () => {
    expect(testErrors((t) => markers(t, 3, 0).pop())).toContainEqual(
      "parts[3].questionGroups[0].markers: one marker for each question, and no other",
    );
    expect(
      testErrors((t) => (markers(t, 3, 0)[0]!.id = "p4-m-32")),
    ).toContainEqual(
      "parts[3].questionGroups[0].markers: marker ids must be unique",
    );
  });

  it("needs a described image in an allowed format and size", () => {
    const image = (t: Test) => group(t, 1, 2).image as Record<string, unknown>;
    expect(testErrors((t) => delete image(t).description)).toContainEqual(
      "parts[1].questionGroups[2].image.description: expected a non-empty string",
    );
    expect(testErrors((t) => (image(t).mimeType = "image/png"))).toContainEqual(
      'parts[1].questionGroups[2].image.mimeType: expected "image/svg+xml" or "image/webp"',
    );
    expect(testErrors((t) => (image(t).bytes = 150_000))).toContainEqual(
      "parts[1].questionGroups[2].image.bytes: over the 100 KB budget for image/svg+xml",
    );
  });
});

describe("a transcript", () => {
  function transcriptErrors(
    change: (t: ReturnType<typeof fixtureTranscript>) => void,
  ) {
    const transcript = fixtureTranscript();
    change(transcript);
    const parsed = parseTranscript(validTest(), transcript);
    return parsed.ok ? [] : parsed.errors;
  }
  const segments = (t: ReturnType<typeof fixtureTranscript>, part = 0) =>
    t.parts[part]!.segments;

  it("accepts timed segments for every part of its test", () => {
    expect(transcriptErrors(() => {})).toEqual([]);
  });

  it("belongs to its test and version, with a revision and a review status", () => {
    const errors = transcriptErrors((t) => {
      Object.assign(t, { testId: "other", version: 2, revision: 0 });
      Object.assign(t, { review: { status: "done" } });
    });
    expect(errors).toContainEqual(
      'transcript.testId: expected "fixture-listening"',
    );
    expect(errors).toContainEqual("transcript.version: expected 1");
    expect(errors).toContainEqual(
      expect.stringContaining("transcript.revision"),
    );
    expect(errors).toContainEqual(
      expect.stringContaining("transcript.review.status"),
    );
  });

  it("lists the parts in the test's order", () => {
    expect(transcriptErrors((t) => (t.parts[0]!.partId = "p2"))).toContainEqual(
      'transcript.parts[0].partId: expected "p1"',
    );
  });

  it("keeps segments in order, without overlaps, within the audio", () => {
    expect(
      transcriptErrors((t) => (segments(t)[1]!.startMs = 1000)),
    ).toContainEqual(
      "transcript.parts[0].segments[1]: starts before the previous segment ends",
    );
    expect(
      transcriptErrors((t) => (segments(t)[1]!.endMs = 3500)),
    ).toContainEqual(
      "transcript.parts[0].segments[1]: ends after the part's audio (3000 ms)",
    );
    expect(transcriptErrors((t) => (segments(t)[0]!.endMs = 0))).toContainEqual(
      expect.stringContaining("transcript.parts[0].segments[0].endMs"),
    );
  });

  it("uses each segment id once in the test", () => {
    expect(
      transcriptErrors((t) => (segments(t, 1)[0]!.id = "p1-s1")),
    ).toContainEqual("transcript: segment ids must be unique in the test");
  });
});

describe("an answer key", () => {
  function keyErrors(change: (k: ReturnType<typeof fixtureKey>) => void) {
    const key = fixtureKey();
    change(key);
    const parsed = parseListeningKey(validTest(), validTranscript(), key);
    return parsed.ok ? [] : parsed.errors;
  }
  const entry = (k: ReturnType<typeof fixtureKey>, n: number) =>
    k.answers[String(n)] as {
      accept: string[];
      evidence: { segment: string; quote: string }[];
    };

  it("accepts answers with evidence for all 40 questions", () => {
    expect(keyErrors(() => {})).toEqual([]);
  });

  it("has an entry for every question and none for others", () => {
    const errors = keyErrors((k) => {
      delete k.answers["3"];
      k.answers["41"] = entry(k, 1);
    });
    expect(errors).toContainEqual("key.answers.3: missing");
    expect(errors).toContainEqual("key.answers.41: no such question");
  });

  it("accepts only options a question offers", () => {
    expect(keyErrors((k) => (entry(k, 8).accept = ["D"]))).toContainEqual(
      'key.answers.8.accept: "D" is not an option of question 8',
    );
    expect(keyErrors((k) => (entry(k, 18).accept = ["E"]))).toContainEqual(
      'key.answers.18.accept: "E" is not an option of question 18',
    );
  });

  it("lists typed variants once each", () => {
    expect(
      keyErrors((k) => (entry(k, 1).accept = ["Here", " here"])),
    ).toContainEqual(
      'key.answers.1.accept: " here" repeats another accepted answer',
    );
  });

  it("gives a choose-several item the same set, one option per number", () => {
    expect(keyErrors((k) => (entry(k, 22).accept = ["A", "B"]))).toContainEqual(
      "key.answers.21-22: every number of the item needs the same answers",
    );
  });

  it("cites a quote found in a segment of the question's own part", () => {
    expect(
      keyErrors(
        (k) =>
          (entry(k, 1).evidence = [{ segment: "p2-s2", quote: "right here" }]),
      ),
    ).toContainEqual(
      'key.answers.1.evidence[0].segment: "p2-s2" is not a segment of part 1',
    );
    expect(
      keyErrors(
        (k) =>
          (entry(k, 1).evidence = [{ segment: "p1-s2", quote: "not said" }]),
      ),
    ).toContainEqual(
      'key.answers.1.evidence[0].quote: not found in segment "p1-s2"',
    );
    expect(keyErrors((k) => (entry(k, 1).evidence = []))).toContainEqual(
      expect.stringContaining("key.answers.1.evidence: expected a list"),
    );
  });

  it("names the transcript revision it was checked against", () => {
    expect(keyErrors((k) => (k.transcriptRevision = 2))).toContainEqual(
      "key.transcriptRevision: expected 1, the transcript's revision",
    );
    expect(
      keyErrors(
        (k) => delete (k as { transcriptRevision?: number }).transcriptRevision,
      ),
    ).toContainEqual(
      expect.stringContaining(
        "key.transcriptRevision: expected a whole number",
      ),
    );
  });

  it("compares typed variants after normalization and keeps them within the word limit", () => {
    expect(
      keyErrors((k) => (entry(k, 1).accept = ["Right here.", "right  here"])),
    ).toContainEqual(
      'key.answers.1.accept: "right  here" repeats another accepted answer',
    );
    expect(
      keyErrors((k) => (entry(k, 27).accept = ["here", "right here"])),
    ).toContainEqual(
      'key.answers.27.accept: "right here" is over the word limit',
    );
  });

  const extra = (k: ReturnType<typeof fixtureKey>, n: number) =>
    k.answers[String(n)] as Record<string, unknown>;
  const said = { segment: "p1-s2", quote: "right here", review: "verified" };

  it("allows fromRecording on typed answers only", () => {
    expect(keyErrors((k) => (extra(k, 1).fromRecording = true))).toEqual([]);
    expect(keyErrors((k) => (extra(k, 8).fromRecording = true))).toContainEqual(
      "key.answers.8.fromRecording: only typed answers can have it",
    );
  });

  it("allows only the content tags of the spec, the same on every number of an item", () => {
    expect(keyErrors((k) => (extra(k, 1).tag = "correction"))).toEqual([]);
    expect(keyErrors((k) => (extra(k, 1).tag = "weakListener"))).toContainEqual(
      "key.answers.1.tag: expected one of paraphrase, spelledOut, correction",
    );
    expect(keyErrors((k) => (extra(k, 21).tag = "paraphrase"))).toContainEqual(
      "key.answers.21-22: every number needs the same tag",
    );
  });

  it("checks a distractor like evidence, with a review status per entry", () => {
    expect(
      keyErrors((k) => (extra(k, 8).distractors = [{ option: "B", ...said }])),
    ).toEqual([]);
    expect(
      keyErrors(
        (k) => (extra(k, 1).distractors = [{ text: "there", ...said }]),
      ),
    ).toEqual([]);
    expect(
      keyErrors(
        (k) =>
          (extra(k, 8).distractors = [
            { option: "B", ...said, review: "reviewed" },
          ]),
      ),
    ).toContainEqual(
      "key.answers.8.distractors[0].review: expected one of aiDraft, verified",
    );
    expect(
      keyErrors(
        (k) =>
          (extra(k, 8).distractors = [
            { option: "B", ...said, quote: "not said" },
          ]),
      ),
    ).toContainEqual(
      'key.answers.8.distractors[0].quote: not found in segment "p1-s2"',
    );
  });

  it("never lists an accepted answer, or something the question cannot take, as a distractor", () => {
    expect(
      keyErrors((k) => (extra(k, 8).distractors = [{ option: "A", ...said }])),
    ).toContainEqual(
      'key.answers.8.distractors[0].option: "A" is an accepted answer',
    );
    expect(
      keyErrors((k) => (extra(k, 8).distractors = [{ option: "D", ...said }])),
    ).toContainEqual(
      'key.answers.8.distractors[0].option: "D" is not an option of the question',
    );
    expect(
      keyErrors(
        (k) => (extra(k, 1).distractors = [{ text: "Here.", ...said }]),
      ),
    ).toContainEqual(
      'key.answers.1.distractors[0].text: "Here." is an accepted answer',
    );
    expect(
      keyErrors((k) => (extra(k, 8).distractors = [{ text: "B", ...said }])),
    ).toContainEqual(
      "key.answers.8.distractors[0].text: a chosen answer's distractor is an option",
    );
  });

  it("keeps the answers of a List TWO question apart, and orders only such a question", () => {
    expect(
      keyErrors((k) => (entry(k, 38).accept = ["milk", "Bread"])),
    ).toContainEqual('key.answers.37-38: "bread" is listed under two numbers');
    expect(keyErrors((k) => (extra(k, 37).ordered = true))).toEqual([]);
    for (const n of [36, 38])
      expect(keyErrors((k) => (extra(k, n).ordered = true))).toContainEqual(
        `key.answers.${n}.ordered: only the first number of a question with several answers can be ordered`,
      );
  });
});
