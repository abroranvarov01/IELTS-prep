// Token check (run by `pnpm lint`): raw colors may appear only in the token
// file and in platform metadata that cannot read CSS variables
// (docs/design/DESIGN_SYSTEM.md § Token policy).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ALLOWED_FILES = new Set(["apps/web/src/styles/tokens.css"]);
const SOURCE_FILE = /\.(css|[cm]?[jt]sx?)$/;

const RULES = [
  {
    name: "hex color",
    pattern: /(?<![\w&])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![\w-])/gi,
  },
  {
    name: "color function",
    pattern: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi,
  },
  {
    name: "arbitrary color utility",
    pattern:
      /\b(?:bg|text|border(?:-[xytrblse])?|outline|ring(?:-offset)?|fill|stroke|decoration|accent|caret|divide|placeholder|from|via|to|shadow)-\[(?:color:)?[a-z]+\]/g,
  },
];

const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  {
    encoding: "utf8",
  },
)
  .split("\n")
  .filter(
    (file) =>
      SOURCE_FILE.test(file) &&
      !ALLOWED_FILES.has(file) &&
      file !== "scripts/check-tokens.mjs",
  );

const problems = [];
for (const file of files) {
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, index) => {
      for (const { name, pattern } of RULES) {
        for (const match of line.matchAll(pattern)) {
          problems.push(`${file}:${index + 1}  ${name} "${match[0]}"`);
        }
      }
    });
}

if (problems.length > 0) {
  console.error(
    `Raw color values outside the design tokens:\n${problems.join("\n")}`,
  );
  console.error("Use a token from apps/web/src/styles/tokens.css instead.");
  process.exit(1);
}
