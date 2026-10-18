import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ListeningTest } from "../model/content";
import { fixtureTest } from "../model/listening-test.fixture";
import { parseListeningTest } from "../model/parse-content";
import { cachedPartUrl, downloadTestAudio } from "./audio-download";

// Four tiny "recordings" whose hashes the test file records.
const bodies = ["one", "two", "three", "four"].map((s) =>
  new TextEncoder().encode(s),
);
function testWithBodies(): ListeningTest {
  const json = fixtureTest();
  json.parts.forEach((part, i) => {
    const body = bodies[i]!;
    const sha = createHash("sha256").update(body).digest("hex");
    part.audio = {
      ...part.audio,
      src: `part-${i + 1}.${sha.slice(0, 12)}.m4a`,
      sha256: sha,
      bytes: body.byteLength,
    };
  });
  const parsed = parseListeningTest(json);
  if (!parsed.ok) throw new Error(parsed.errors.join("\n"));
  return parsed.value;
}

class MemoryCache {
  entries = new Map<string, Response>();
  async match(url: string) {
    return this.entries.get(url)?.clone();
  }
  async put(url: string, response: Response) {
    this.entries.set(url, response);
  }
  async delete(url: string) {
    return this.entries.delete(url);
  }
  async keys() {
    return [...this.entries.keys()].map(
      (u) => new Request(`http://localhost${u}`),
    );
  }
}

let fetched: string[];
let cache: MemoryCache;
beforeEach(() => {
  fetched = [];
  cache = new MemoryCache();
  vi.stubGlobal("caches", { open: async () => cache });
  vi.stubGlobal("fetch", async (url: string) => {
    fetched.push(url);
    const i = Number(/part-(\d)/.exec(url)?.[1]) - 1;
    return new Response(bodies[i]);
  });
  URL.createObjectURL = vi.fn(() => `blob:${fetched.length}`);
});
afterEach(() => vi.unstubAllGlobals());

describe("the Exam download", () => {
  it("fetches every part, reports the bytes and returns playable URLs", async () => {
    const progress: number[] = [];
    const urls = await downloadTestAudio(testWithBodies(), (p) =>
      progress.push(p.loaded),
    );
    expect(Object.keys(urls)).toEqual(["p1", "p2", "p3", "p4"]);
    expect(fetched).toHaveLength(4);
    expect(progress.at(-1)).toBe(3 + 3 + 5 + 4);
  });

  it("does not download again what the cache already holds", async () => {
    const test = testWithBodies();
    await downloadTestAudio(test, () => {});
    fetched = [];
    await downloadTestAudio(test, () => {});
    expect(fetched).toEqual([]);
  });

  it("rejects a file that does not match its hash, keeping the parts already stored", async () => {
    const test = testWithBodies();
    vi.stubGlobal("fetch", async (url: string) => {
      fetched.push(url);
      return new Response(
        url.includes("part-3")
          ? "tampered"
          : bodies[Number(/part-(\d)/.exec(url)?.[1]) - 1],
      );
    });
    await expect(downloadTestAudio(test, () => {})).rejects.toThrow("hash");
    expect(cache.entries.size).toBe(2);
  });

  it("works from memory where Cache Storage is missing", async () => {
    vi.stubGlobal("caches", undefined);
    // `"caches" in globalThis` is still true with an undefined stub; remove it.
    delete (globalThis as { caches?: unknown }).caches;
    const urls = await downloadTestAudio(testWithBodies(), () => {});
    expect(Object.keys(urls)).toHaveLength(4);
  });

  it("fails when the server does not answer", async () => {
    vi.stubGlobal("fetch", async () => new Response("", { status: 503 }));
    await expect(downloadTestAudio(testWithBodies(), () => {})).rejects.toThrow(
      "503",
    );
  });
});

describe("review audio from the cache", () => {
  it("plays a part from a valid cached copy, without the network", async () => {
    const test = testWithBodies();
    await downloadTestAudio(test, () => {});
    fetched = [];
    expect(await cachedPartUrl(test, test.parts[1]!)).toMatch(/^blob:/);
    expect(fetched).toEqual([]);
  });

  it("finds nothing when the part is not cached, or its copy does not match its hash", async () => {
    const test = testWithBodies();
    expect(await cachedPartUrl(test, test.parts[0]!)).toBeUndefined();
    const part = test.parts[0]!;
    cache.entries.set(
      `/media/listening/${test.id}/${part.audio.src}`,
      new Response("tampered"),
    );
    expect(await cachedPartUrl(test, part)).toBeUndefined();
  });

  it("finds nothing where Cache Storage is missing", async () => {
    delete (globalThis as { caches?: unknown }).caches;
    const test = testWithBodies();
    expect(await cachedPartUrl(test, test.parts[0]!)).toBeUndefined();
  });
});
