import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { QUESTION_COUNT, groupNumbers } from "@/domain/reading/content";
import {
  parseAnswerKey,
  parseReadingTest,
} from "@/domain/reading/parse-content";
import { parseExplanations } from "@/domain/reading/explanations";
import { checkAttempt } from "@/domain/reading/scoring";
import type { Answer } from "@/domain/reading/session";
import { questionUnits } from "@/domain/reading/units";
import { routing } from "@/i18n/routing";
import { readingExplanations } from "./reading-explanations";

// Every Reading test in the repository must validate with its answer key
// (ADR-0005 §3), so broken content cannot be merged.
const CONTENT_DIR = path.join(import.meta.dirname, "../../content/reading");
const testFiles = readdirSync(CONTENT_DIR).filter(
  (file) =>
    file.endsWith(".json") &&
    !file.endsWith(".key.json") &&
    !file.includes(".explanations."),
);
const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(CONTENT_DIR, file), "utf8"));

describe("Reading content files", () => {
  it("exist", () => {
    expect(testFiles.length).toBeGreaterThan(0);
  });

  for (const file of testFiles) {
    describe(file, () => {
      const parsed = parseReadingTest(readJson(file));

      it("is a valid Reading test", () => {
        expect(parsed.ok ? [] : parsed.errors).toEqual([]);
      });

      it("is named after its id", () => {
        expect(parsed.ok && `${parsed.value.id}.json`).toBe(file);
      });

      it("has a valid answer key with evidence for every answer except NOT GIVEN", () => {
        if (!parsed.ok) throw new Error("the test itself is invalid");
        const key = parseAnswerKey(
          parsed.value,
          readJson(file.replace(/\.json$/, ".key.json")),
        );
        expect(key.ok ? [] : key.errors).toEqual([]);
        if (key.ok) {
          for (let n = 1; n <= QUESTION_COUNT; n++) {
            const entry = key.value.answers[n];
            // A NOT GIVEN answer may cite no sentence (ADR-0008 §3).
            if (entry?.accept.join() === "NOT GIVEN") continue;
            expect(entry?.evidence.length).toBeGreaterThan(0);
          }
        }
      });

      it("has valid explanations in every interface language", () => {
        if (!parsed.ok) throw new Error("the test itself is invalid");
        for (const locale of routing.locales) {
          const explanations = parseExplanations(
            parsed.value,
            readJson(file.replace(/\.json$/, `.explanations.${locale}.json`)),
            locale,
          );
          expect(explanations.ok ? [] : explanations.errors).toEqual([]);
          expect(readingExplanations(parsed.value.id, locale)?.locale).toBe(
            locale,
          );
        }
      });

      it("has exactly 40 scoring positions and at most 40 marks", () => {
        if (!parsed.ok) throw new Error("the test itself is invalid");
        const key = parseAnswerKey(
          parsed.value,
          readJson(file.replace(/\.json$/, ".key.json")),
        );
        if (!key.ok) throw new Error(key.errors.join("\n"));
        const answers: Record<string, Answer> = {};
        for (const unit of questionUnits(parsed.value)) {
          const accept = key.value.answers[unit.numbers[0] ?? 0]?.accept ?? [];
          answers[unit.key] =
            unit.kind === "multi" ? accept : (accept[0] ?? "");
        }
        const check = (a: Record<string, Answer>) =>
          checkAttempt(parsed.value, key.value, {
            answers: a,
            pins: {},
            finishReason: "user",
          }).score;
        expect(check(answers)).toEqual({
          kind: "practiceRawScore",
          marks: QUESTION_COUNT,
          positions: QUESTION_COUNT,
        });
        expect(check({}).positions).toBe(QUESTION_COUNT);
      });
    });
  }

  it("the demo test keeps content version 1 and its key starts at revision 1", () => {
    expect(
      (readJson("demo-academic-1.json") as { version: number }).version,
    ).toBe(1);
    expect(
      (readJson("demo-academic-1.key.json") as { revision: number }).revision,
    ).toBe(1);
  });

  it("the demo test uses every question type of the M4 scope", () => {
    const parsed = parseReadingTest(readJson("demo-academic-1.json"));
    if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
    const groups = parsed.value.passages.flatMap((p) => p.questionGroups);
    expect(new Set(groups.map((g) => g.type)).size).toBe(13);
    expect(groups.flatMap(groupNumbers)).toHaveLength(QUESTION_COUNT);
  });
});

// A shipped test file may change only together with a new content version,
// and a key file only with a new revision (ADR-0008 §3), because stored
// sessions and result records refer to them. When this fails: increase the
// version (test) or the revision (key), then record the new fingerprint here.
const FINGERPRINTS: Record<string, { number: number; sha256: string }> = {
  "demo-academic-1.json": {
    number: 1,
    sha256: "3f06cac37a014264a9431dba4cc574af45983f5a9897870d6d8f4f588f9b9eee",
  },
  "demo-academic-1.key.json": {
    number: 1,
    sha256: "e81438bf3a388055e5648c876306764657a67b544a88611d75f215ad32cbe9c5",
  },
};

describe("Reading content fingerprints", () => {
  const files = readdirSync(CONTENT_DIR).filter(
    (file) => file.endsWith(".json") && !file.includes(".explanations."),
  );

  for (const file of files) {
    it(`${file} changes only with a new ${file.endsWith(".key.json") ? "revision" : "version"}`, () => {
      const raw = readFileSync(path.join(CONTENT_DIR, file));
      const data = JSON.parse(raw.toString("utf8")) as {
        version: number;
        revision?: number;
      };
      const number = file.endsWith(".key.json") ? data.revision : data.version;
      const sha256 = createHash("sha256").update(raw).digest("hex");
      expect(
        { number, sha256 },
        `${file}: increase its ${file.endsWith(".key.json") ? "revision" : "version"} and record the new fingerprint`,
      ).toEqual(FINGERPRINTS[file]);
    });
  }
});
