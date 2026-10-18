import type { ListeningTest } from "../model/content";
import { audioBytes, mediaUrl } from "../model/media";

// The Exam download (ADR-0013 §2): every part's file is fetched before the
// recording starts, checked against its sha256, kept in Cache Storage so a
// reload does not download again, and played from blob: URLs. Where Cache
// Storage is missing or short of space, the files stay in memory.

const CACHE = "listening-audio-v1";

export type DownloadProgress = { loaded: number; total: number };

/** Blob URLs by part id. */
export type DownloadedAudio = Record<string, string>;

async function openCache(test: ListeningTest): Promise<Cache | undefined> {
  try {
    if (!("caches" in globalThis)) return undefined;
    const estimate = await navigator.storage?.estimate?.();
    if (
      estimate?.quota !== undefined &&
      estimate.usage !== undefined &&
      estimate.quota - estimate.usage < 2 * audioBytes(test)
    )
      return undefined;
    return await caches.open(CACHE);
  } catch {
    return undefined;
  }
}

async function sha256(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function readWithProgress(
  response: Response,
  onBytes: (n: number) => void,
): Promise<ArrayBuffer> {
  if (!response.body) {
    const buffer = await response.arrayBuffer();
    onBytes(buffer.byteLength);
    return buffer;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    onBytes(value.byteLength);
  }
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out.buffer;
}

/**
 * Downloads (or finds in the cache) every part of a test, verified. Rejects
 * when a file cannot be fetched or does not match; the parts already stored
 * stay, so "Try again" fetches only what is missing.
 */
export async function downloadTestAudio(
  test: ListeningTest,
  onProgress: (progress: DownloadProgress) => void,
  signal?: AbortSignal,
): Promise<DownloadedAudio> {
  const cache = await openCache(test);
  const total = audioBytes(test);
  let loaded = 0;
  const urls: DownloadedAudio = {};
  for (const part of test.parts) {
    const url = mediaUrl(test, part.audio.src);
    let buffer: ArrayBuffer | undefined;
    const cached = await cache?.match(url).catch(() => undefined);
    if (cached) {
      buffer = await cached.arrayBuffer();
      if ((await sha256(buffer)) !== part.audio.sha256) {
        await cache?.delete(url).catch(() => undefined);
        buffer = undefined;
      }
    }
    if (buffer) {
      loaded += buffer.byteLength;
      onProgress({ loaded, total });
    } else {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`audio ${response.status}`);
      buffer = await readWithProgress(response, (n) => {
        loaded += n;
        onProgress({ loaded: Math.min(loaded, total), total });
      });
      if ((await sha256(buffer)) !== part.audio.sha256)
        throw new Error("audio does not match its hash");
      await cache
        ?.put(
          url,
          new Response(buffer, {
            headers: { "Content-Type": part.audio.mimeType },
          }),
        )
        .catch(() => undefined);
    }
    urls[part.id] = URL.createObjectURL(
      new Blob([buffer], { type: part.audio.mimeType }),
    );
  }
  return urls;
}

/**
 * A part's file from Cache Storage, as a blob: URL, when a copy that matches
 * its sha256 is there (left by an Exam download); otherwise undefined. The
 * review plays it before asking the network (owner, M9-04 clarification).
 */
export async function cachedPartUrl(
  test: ListeningTest,
  part: ListeningTest["parts"][number],
): Promise<string | undefined> {
  try {
    if (!("caches" in globalThis)) return undefined;
    const cache = await caches.open(CACHE);
    const cached = await cache.match(mediaUrl(test, part.audio.src));
    if (!cached) return undefined;
    const buffer = await cached.arrayBuffer();
    if ((await sha256(buffer)) !== part.audio.sha256) return undefined;
    return URL.createObjectURL(
      new Blob([buffer], { type: part.audio.mimeType }),
    );
  } catch {
    // Storage blocked or unreadable: the network is asked instead.
    return undefined;
  }
}

/**
 * Keeps at most the files of tests with an Exam in progress (ADR-0013 §2):
 * everything else in the cache is removed.
 */
export async function cleanUpAudioCache(keep: ListeningTest[]): Promise<void> {
  try {
    if (!("caches" in globalThis)) return;
    const cache = await caches.open(CACHE);
    const wanted = new Set(
      keep.flatMap((test) =>
        test.parts.map(
          (part) =>
            new URL(mediaUrl(test, part.audio.src), location.origin).href,
        ),
      ),
    );
    for (const request of await cache.keys())
      if (!wanted.has(request.url)) await cache.delete(request);
  } catch {
    // Nothing to clean, or storage is blocked.
  }
}
