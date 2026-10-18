import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseExplanations } from "../model/explanations";
import {
  parseListeningKey,
  parseListeningTest,
  parseTranscript,
} from "../model/parse-content";
import { checkAssetFiles } from "./assets.server";

// Every Listening test in the repository must validate with its transcript,
// key and media files (ADR-0012 §7), so broken content cannot be merged.
const WEB = path.join(import.meta.dirname, "../../../..");
const CONTENT_DIR = path.join(WEB, "content/listening");
const MEDIA_DIR = path.join(WEB, "public/media/listening");

const files = existsSync(CONTENT_DIR) ? readdirSync(CONTENT_DIR) : [];
const testFiles = files.filter(
  (f) =>
    f.endsWith(".json") &&
    !f.endsWith(".key.json") &&
    !f.endsWith(".transcript.json") &&
    !f.includes(".explanations."),
);
const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(CONTENT_DIR, file), "utf8"));

// A shipped test file may change only with a new content version, and a key
// or transcript file only with a new revision (ADR-0012 §7, ADR-0008 §3).
// When this fails: increase the number, then record the new fingerprint here.
const FINGERPRINTS: Record<string, { number: number; sha256: string }> = {
  "temporary-voa-1.json": {
    number: 1,
    sha256: "8a25788a8f6d53d299805ee50f17099d4341d3ffefa7a009d430382b14a9e128",
  },
  "temporary-voa-1.key.json": {
    number: 3,
    sha256: "c07677ead482c7a0b6772476505f6473a6b2befe359c80b014a740b9e919b630",
  },
  "temporary-voa-1.transcript.json": {
    number: 1,
    sha256: "5abec681612fe034bf7576de48f59c7d8c7eb2f3a4e9bf0c2ec98bdff3e25b88",
  },
};

describe("Listening content files", () => {
  it("exist", () => {
    expect(testFiles.length).toBeGreaterThan(0);
  });

  for (const file of testFiles) {
    describe(file, () => {
      const parsed = parseListeningTest(readJson(file));
      const base = file.replace(/\.json$/, "");

      it("is a valid Listening test named after its id", () => {
        expect(parsed.ok ? [] : parsed.errors).toEqual([]);
        expect(parsed.ok && `${parsed.value.id}.json`).toBe(file);
      });

      it("has its media files, unchanged", () => {
        if (!parsed.ok) throw new Error("the test itself is invalid");
        expect(
          checkAssetFiles(parsed.value, path.join(MEDIA_DIR, parsed.value.id)),
        ).toEqual([]);
      });

      it("has a valid transcript and answer key", () => {
        if (!parsed.ok) throw new Error("the test itself is invalid");
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
        expect(key.ok ? [] : key.errors).toEqual([]);
      });

      it("has valid explanations in every interface language", () => {
        if (!parsed.ok) throw new Error("the test itself is invalid");
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
        const errors = ["uz", "ru", "en"].flatMap((locale) => {
          const explanations = parseExplanations(
            parsed.value,
            key.value,
            transcript.value,
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
    // Explanations are content shown next to a result, not part of it (ADR-0008 §1).
    for (const file of files.filter(
      (f) => f.endsWith(".json") && !f.includes(".explanations."),
    )) {
      const raw = readFileSync(path.join(CONTENT_DIR, file));
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
