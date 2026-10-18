import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { unsafeSvgParts } from "@/shared/content/shapes";
import type { ListeningTest } from "../model/content";

/**
 * Checks a test's audio and image files on disk against what the test file
 * records: present, the same size and hash, and SVG with nothing that could
 * run (ADR-0012 §7). `dir` is the test's media folder (ADR-0013 §1).
 */
export function checkAssetFiles(test: ListeningTest, dir: string): string[] {
  const errors: string[] = [];
  const assets = test.parts.flatMap((part, i) => [
    { path: `parts[${i}].audio`, ...part.audio },
    ...part.questionGroups.flatMap((group, j) =>
      group.type === "labelling"
        ? [{ path: `parts[${i}].questionGroups[${j}].image`, ...group.image }]
        : [],
    ),
  ]);
  for (const asset of assets) {
    let file: Buffer;
    try {
      file = readFileSync(path.join(dir, asset.src));
    } catch {
      errors.push(`${asset.path}.src: no file "${asset.src}"`);
      continue;
    }
    if (file.length !== asset.bytes)
      errors.push(`${asset.path}.bytes: the file has ${file.length} bytes`);
    if (createHash("sha256").update(file).digest("hex") !== asset.sha256)
      errors.push(`${asset.path}.sha256: does not match the file`);
    if (asset.mimeType === "image/svg+xml")
      for (const part of unsafeSvgParts(file.toString("utf8")))
        errors.push(`${asset.path}: the SVG contains ${part}`);
  }
  return errors;
}
