import { describe, expect, it } from "vitest";
import {
  answerOptionIds,
  checkHashedName,
  readImage,
  readProvenance,
  unsafeSvgParts,
} from "./shapes";

const PROVENANCE = {
  producedBy: "IELTS Prep tests",
  method: "drawn",
  license: "Original",
  producedAt: "2026-10-18",
};
const SHA = "ab".repeat(32);

function errorsOf(read: (errors: string[]) => unknown): string[] {
  const errors: string[] = [];
  read(errors);
  return errors;
}

describe("hashed file names", () => {
  it("accept a name with the first 12 hex digits of the hash and the right extension", () => {
    expect(
      errorsOf((e) =>
        checkHashedName(e, "src", "part-1.abababababab.m4a", SHA, "m4a"),
      ),
    ).toEqual([]);
  });

  it("reject another extension", () => {
    expect(
      errorsOf((e) =>
        checkHashedName(e, "src", "part-1.abababababab.mp3", SHA, "m4a"),
      ),
    ).toEqual(["src: expected the extension .m4a"]);
  });
});

describe("images", () => {
  const webp = {
    src: "map.abababababab.webp",
    mimeType: "image/webp",
    width: 800,
    height: 600,
    alt: "Map",
    description: "A map of a town centre.",
    bytes: 50_000,
    sha256: SHA,
    provenance: PROVENANCE,
  };

  it("need WebP pictures wide enough for the enlarged view", () => {
    expect(errorsOf((e) => readImage(e, "image", webp))).toEqual([
      "image.width: a WebP image needs at least 1200 px",
    ]);
  });

  it("keep WebP pictures within 200 KB", () => {
    expect(
      errorsOf((e) =>
        readImage(e, "image", { ...webp, width: 1600, bytes: 250_000 }),
      ),
    ).toEqual(["image.bytes: over the 200 KB budget for image/webp"]);
  });
});

describe("provenance", () => {
  it("records how the asset was made and when", () => {
    expect(
      errorsOf((e) =>
        readProvenance(e, "p", {
          ...PROVENANCE,
          method: "copied",
          producedAt: "18.10.2026",
        }),
      ),
    ).toEqual([
      'p.method: expected "synthetic", "recorded" or "drawn"',
      "p.producedAt: expected YYYY-MM-DD",
    ]);
  });

  it("keeps the source address and attribution of third-party material", () => {
    const errors: string[] = [];
    expect(
      readProvenance(errors, "p", {
        ...PROVENANCE,
        method: "recorded",
        sourceUrl: "https://example.org/item",
        attribution: "Source: Example",
      }),
    ).toMatchObject({
      sourceUrl: "https://example.org/item",
      attribution: "Source: Example",
    });
    expect(errors).toEqual([]);
  });
});

describe("SVG safety", () => {
  it("finds nothing in a plain drawing", () => {
    expect(
      unsafeSvgParts(
        '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="url(#g)"/></svg>',
      ),
    ).toEqual([]);
  });

  it("finds scripts, event handlers, foreignObject and links to other files", () => {
    expect(
      unsafeSvgParts(
        '<svg><script>x</script><rect onclick="x"/><foreignObject/><image href="a.png"/><rect style="fill:url(b.svg)"/></svg>',
      ),
    ).toEqual([
      "a script",
      "an event handler",
      "foreignObject",
      "a link to another file",
      "a url() to another file",
    ]);
  });
});

describe("answer options", () => {
  it("are the letters on the picture when the markers are the options", () => {
    expect(
      answerOptionIds({ kind: "marker", allowRepeat: false }, [
        { id: "m1", label: "A", x: 1, y: 1, option: "A" },
        { id: "m2", label: "7", x: 1, y: 1, question: 7 },
      ]),
    ).toEqual(["A"]);
  });

  it("are none for typed answers", () => {
    expect(
      answerOptionIds({
        kind: "typed",
        wordLimit: { words: 2, numbers: true },
      }),
    ).toBeUndefined();
  });
});
