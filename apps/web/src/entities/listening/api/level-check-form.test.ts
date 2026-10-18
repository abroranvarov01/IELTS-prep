import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { routing } from "@/shared/i18n/routing";
import { LEVEL_CHECK_LISTENING_SHAPE as SHAPE } from "../forms.server";
import { parseExplanations } from "../model/explanations";
import {
  parseListeningKey,
  parseListeningTest,
  parseTranscript,
} from "../model/parse-content";
import { checkAssetFiles } from "./assets.server";
import { listeningTestIds } from "./content.server";

// The level check's Listening forms (ADR-0014 §7; LISTENING_EXPERIENCE.md,
// LD19): files in the Listening content contract with their own shape, kept
// out of the Listening tests, validated with their media, transcript, key
// and explanations as the tests are.
const WEB = path.join(import.meta.dirname, "../../../..");
const FORM_DIR = path.join(WEB, "content/level-check/listening");
const MEDIA_DIR = path.join(WEB, "public/media/listening");
const files = readdirSync(FORM_DIR);
const formFiles = files.filter(
  (f) =>
    f.endsWith(".json") &&
    !f.endsWith(".key.json") &&
    !f.endsWith(".transcript.json") &&
    !f.includes(".explanations."),
);
const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(FORM_DIR, file), "utf8"));

// A shipped form may change only with a new version, and its key or
// transcript only with a new revision (ADR-0012 §7, ADR-0008 §3).
const FINGERPRINTS: Record<string, { number: number; sha256: string }> = {
  "level-check-listening-a.json": {
    number: 1,
    sha256: "884dcd23bff3e41305521a5135a61363815305c9d3a7f4c730175f8f900708a2",
  },
  "level-check-listening-a.key.json": {
    number: 1,
    sha256: "ca4419b15553b7d9dd197e9d5523cbde40b02f0669f30e27119a863c123b61f4",
  },
  "level-check-listening-a.transcript.json": {
    number: 1,
    sha256: "e44703d1280092ef34015d8c8db87bbc96b11f0cf8486f3e305bdccf895751a3",
  },
};

describe("Level-check Listening form files", () => {
  it("exist", () => {
    expect(formFiles.length).toBeGreaterThan(0);
  });

  for (const file of formFiles) {
    describe(file, () => {
      const parsed = parseListeningTest(readJson(file), SHAPE);
      const base = file.replace(/\.json$/, "");
      const checking = () => {
        if (!parsed.ok) throw new Error("the form itself is invalid");
        const transcript = parseTranscript(
          parsed.value,
          readJson(`${base}.transcript.json`),
        );
        if (!transcript.ok) throw new Error(transcript.errors.join("\n"));
        const key = parseListeningKey(
          parsed.value,
          transcript.value,
          readJson(`${base}.key.json`),
        );
        if (!key.ok) throw new Error(key.errors.join("\n"));
        return {
          form: parsed.value,
          transcript: transcript.value,
          key: key.value,
        };
      };

      it("is a valid temporary form of two recordings and 14 questions, not a Listening test", () => {
        expect(parsed.ok ? [] : parsed.errors).toEqual([]);
        expect(parsed.ok && `${parsed.value.id}.json`).toBe(file);
        expect(parsed.ok && parsed.value.temporary).toBe(true);
        expect(listeningTestIds()).not.toContain(parsed.ok && parsed.value.id);
      });

      it("uses four or five question types, without labelling (LD19)", () => {
        const { form } = checking();
        const types = new Set(
          form.parts.flatMap((p) => p.questionGroups.map((g) => g.type)),
        );
        expect(types.size).toBeGreaterThanOrEqual(4);
        expect(types.size).toBeLessThanOrEqual(5);
        expect(types.has("labelling")).toBe(false);
      });

      it("has its media files, unchanged", () => {
        const { form } = checking();
        expect(checkAssetFiles(form, path.join(MEDIA_DIR, form.id))).toEqual(
          [],
        );
      });

      it("has a draft key with evidence for every answer", () => {
        const { key } = checking();
        expect(key.review.status).toBe("aiDraft");
        for (let n = 1; n <= SHAPE.parts * SHAPE.questionsPerPart; n++)
          expect(key.answers[n]?.evidence.length).toBeGreaterThan(0);
      });

      it("has valid explanations in every interface language", () => {
        const { form, key, transcript } = checking();
        const errors = routing.locales.flatMap((locale) => {
          const explanations = parseExplanations(
            form,
            key,
            transcript,
            readJson(`${base}.explanations.${locale}.json`),
            locale,
          );
          return explanations.ok
            ? []
            : explanations.errors.map((e) => `${locale}: ${e}`);
        });
        expect(errors).toEqual([]);
      });
    });
  }

  it("each change with a new version or revision", () => {
    for (const file of files.filter(
      (f) => f.endsWith(".json") && !f.includes(".explanations."),
    )) {
      const raw = readFileSync(path.join(FORM_DIR, file));
      const data = JSON.parse(raw.toString("utf8")) as {
        version: number;
        revision?: number;
      };
      const revisioned =
        file.endsWith(".key.json") || file.endsWith(".transcript.json");
      expect(
        {
          number: revisioned ? data.revision : data.version,
          sha256: createHash("sha256").update(raw).digest("hex"),
        },
        `${file}: increase its ${revisioned ? "revision" : "version"} and record the new fingerprint`,
      ).toEqual(FINGERPRINTS[file]);
    }
  });
});
