import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "./manifest";

const tokens = readFileSync(join(__dirname, "../styles/tokens.css"), "utf8");

function token(name: string): string | undefined {
  return tokens.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1];
}

describe("web app manifest", () => {
  it("uses the surface.base token for its background and theme colors", () => {
    const { background_color, theme_color } = manifest();
    expect(background_color).toBe(token("color-surface-base"));
    expect(theme_color).toBe(token("color-surface-base"));
  });
});
