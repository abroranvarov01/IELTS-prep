import { copyFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureTest } from "../model/listening-test.fixture";
import { parseListeningTest } from "../model/parse-content";
import { checkAssetFiles } from "./assets.server";

const MEDIA = path.join(import.meta.dirname, "../testing/media");

function fixture() {
  const parsed = parseListeningTest(fixtureTest());
  if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
  return parsed.value;
}

describe("a test's media files", () => {
  it("match the sizes and hashes the test records", () => {
    expect(checkAssetFiles(fixture(), MEDIA)).toEqual([]);
  });

  it("are reported when missing", () => {
    const empty = mkdtempSync(path.join(tmpdir(), "listening-media-"));
    expect(checkAssetFiles(fixture(), empty)).toContainEqual(
      'parts[0].audio.src: no file "tone.6ffd8c74b928.m4a"',
    );
  });

  it("are reported when a file changed after it was recorded", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "listening-media-"));
    copyFileSync(
      path.join(MEDIA, "plan.8442559a94d7.svg"),
      path.join(dir, "plan.8442559a94d7.svg"),
    );
    writeFileSync(path.join(dir, "tone.6ffd8c74b928.m4a"), "not the recording");
    const errors = checkAssetFiles(fixture(), dir);
    expect(errors).toContainEqual(
      "parts[0].audio.bytes: the file has 17 bytes",
    );
    expect(errors).toContainEqual(
      "parts[0].audio.sha256: does not match the file",
    );
  });

  it("reject an SVG that contains a script", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "listening-media-"));
    copyFileSync(
      path.join(MEDIA, "tone.6ffd8c74b928.m4a"),
      path.join(dir, "tone.6ffd8c74b928.m4a"),
    );
    writeFileSync(
      path.join(dir, "plan.8442559a94d7.svg"),
      "<svg><script>alert(1)</script></svg>",
    );
    expect(checkAssetFiles(fixture(), dir)).toContainEqual(
      "parts[1].questionGroups[2].image: the SVG contains a script",
    );
  });
});
