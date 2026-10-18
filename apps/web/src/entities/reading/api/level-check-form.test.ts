import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { routing } from "@/shared/i18n/routing";
import { groupNumbers } from "../model/content";
import { parseExplanations } from "../model/explanations";
import { parseAnswerKey, parseReadingTest } from "../model/parse-content";
import { checkAttempt } from "../model/scoring";
import type { Answer } from "../model/session";
import { questionUnits } from "../model/units";
import { readingTestIds } from "./content.server";
import { LEVEL_CHECK_FORM_SHAPE as FORM_SHAPE } from "../forms.server";

// The level-check forms (ADR-0011 §1; LEVEL_CHECK.md §3, §8): files in the
// Reading content contract with their own shape, kept out of the Reading
// catalog, validated with their key and explanations like the tests.
const FORM_DIR = path.join(
  import.meta.dirname,
  "../../../../content/level-check",
);
const formFiles = readdirSync(FORM_DIR).filter(
  (file) =>
    file.endsWith(".json") &&
    !file.endsWith(".key.json") &&
    !file.includes(".explanations."),
);
const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(FORM_DIR, file), "utf8"));

describe("Level-check form files", () => {
  it("exist", () => {
    expect(formFiles.length).toBeGreaterThan(0);
  });

  for (const file of formFiles) {
    describe(file, () => {
      const parsed = parseReadingTest(readJson(file), FORM_SHAPE);

      it("is a valid form of two passages and 14 questions", () => {
        expect(parsed.ok ? [] : parsed.errors).toEqual([]);
      });

      it("is named after its id and is not a Reading test of the catalog", () => {
        expect(parsed.ok && `${parsed.value.id}.json`).toBe(file);
        expect(parsed.ok && readingTestIds()).not.toContain(
          parsed.ok && parsed.value.id,
        );
      });

      it("uses four or five of the approved question types", () => {
        if (!parsed.ok) throw new Error("the form itself is invalid");
        const types = new Set(
          parsed.value.passages.flatMap((p) =>
            p.questionGroups.map((g) => g.type),
          ),
        );
        expect(types.size).toBeGreaterThanOrEqual(4);
        expect(types.size).toBeLessThanOrEqual(5);
      });

      it("has a valid answer key with evidence for every answer except NOT GIVEN", () => {
        if (!parsed.ok) throw new Error("the form itself is invalid");
        const key = parseAnswerKey(
          parsed.value,
          readJson(file.replace(/\.json$/, ".key.json")),
        );
        expect(key.ok ? [] : key.errors).toEqual([]);
        if (key.ok) {
          expect(key.value.review.status).toBe("aiDraft");
          for (let n = 1; n <= FORM_SHAPE.questions; n++) {
            const entry = key.value.answers[n];
            if (entry?.accept.join() === "NOT GIVEN") continue;
            expect(entry?.evidence.length).toBeGreaterThan(0);
          }
        }
      });

      it("has valid explanations in every interface language", () => {
        if (!parsed.ok) throw new Error("the form itself is invalid");
        for (const locale of routing.locales) {
          const explanations = parseExplanations(
            parsed.value,
            readJson(file.replace(/\.json$/, `.explanations.${locale}.json`)),
            locale,
          );
          expect(explanations.ok ? [] : explanations.errors).toEqual([]);
          if (explanations.ok)
            expect(explanations.value.review.status).toBe("aiDraft");
        }
      });

      it("has exactly 14 scoring positions and at most 14 marks", () => {
        if (!parsed.ok) throw new Error("the form itself is invalid");
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
          marks: FORM_SHAPE.questions,
          positions: FORM_SHAPE.questions,
        });
        expect(check({}).positions).toBe(FORM_SHAPE.questions);
        expect(
          parsed.value.passages.flatMap((p) =>
            p.questionGroups.flatMap(groupNumbers),
          ),
        ).toHaveLength(FORM_SHAPE.questions);
      });
    });
  }
});

// A form may change only together with a new form version, and its key only
// with a new revision (ADR-0011 §1, as ADR-0008 §3 for tests), because
// level-check sessions and result records refer to them. When this fails:
// increase the version (form) or the revision (key), then record the new
// fingerprint here.
const FINGERPRINTS: Record<string, { number: number; sha256: string }> = {
  "level-check-reading-a.json": {
    number: 1,
    sha256: "2f4fd3cf6640dfb352ccea03865bba6e8ccb1b4758792f4ee4b436e0e007fb51",
  },
  "level-check-reading-a.key.json": {
    number: 1,
    sha256: "e29c0f5f2750f5bf4fe986a7290c67fb3294c3693e421338281d2b644ed0b101",
  },
};

describe("Level-check form fingerprints", () => {
  for (const [file, { number, sha256 }] of Object.entries(FINGERPRINTS)) {
    it(`${file} is unchanged at version or revision ${number}`, () => {
      const json = readJson(file) as { version?: number; revision?: number };
      expect(json.revision ?? json.version).toBe(number);
      expect(
        createHash("sha256")
          .update(readFileSync(path.join(FORM_DIR, file)))
          .digest("hex"),
      ).toBe(sha256);
    });
  }
});
