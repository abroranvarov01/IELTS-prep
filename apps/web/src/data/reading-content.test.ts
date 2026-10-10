import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { QUESTION_COUNT, groupNumbers } from "@/domain/reading/content";
import {
  parseAnswerKey,
  parseReadingTest,
} from "@/domain/reading/parse-content";

// Every Reading test in the repository must validate with its answer key
// (ADR-0005 §3), so broken content cannot be merged.
const CONTENT_DIR = path.join(import.meta.dirname, "../../content/reading");
const testFiles = readdirSync(CONTENT_DIR).filter(
  (file) => file.endsWith(".json") && !file.endsWith(".key.json"),
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

      it("has a valid answer key with evidence for every question", () => {
        if (!parsed.ok) throw new Error("the test itself is invalid");
        const key = parseAnswerKey(
          parsed.value,
          readJson(file.replace(/\.json$/, ".key.json")),
        );
        expect(key.ok ? [] : key.errors).toEqual([]);
        if (key.ok) {
          for (let n = 1; n <= QUESTION_COUNT; n++) {
            expect(key.value.answers[n]?.evidence.length).toBeGreaterThan(0);
          }
        }
      });
    });
  }

  it("the demo test uses every question type of the M4 scope", () => {
    const parsed = parseReadingTest(readJson("demo-academic-1.json"));
    if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
    const groups = parsed.value.passages.flatMap((p) => p.questionGroups);
    expect(new Set(groups.map((g) => g.type)).size).toBe(13);
    expect(groups.flatMap(groupNumbers)).toHaveLength(QUESTION_COUNT);
  });
});
