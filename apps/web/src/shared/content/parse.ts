import type { GapSegment, Option, Origin, WordLimit } from "./types";

// Readers of untrusted content shared by the Reading and Listening
// validators (ADR-0005 §3, ADR-0012 §7). Each reader returns the value or
// undefined, and pushes every problem with its path onto `errors`.

export type Parsed<T> =
  { ok: true; value: T } | { ok: false; errors: string[] };

/** Who has checked a key, transcript or explanation file (ADR-0008 §6). */
export const REVIEW_STATUSES = ["aiDraft", "reviewed", "approved"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readText(
  errors: string[],
  path: string,
  value: unknown,
): string | undefined {
  if (typeof value === "string" && value.trim() !== "") return value;
  errors.push(`${path}: expected a non-empty string`);
  return undefined;
}

/** Ids are used in addresses and storage keys: letters, digits and hyphens. */
export function readId(
  errors: string[],
  path: string,
  value: unknown,
): string | undefined {
  if (typeof value === "string" && /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/.test(value))
    return value;
  errors.push(`${path}: expected an id of letters, digits and hyphens`);
  return undefined;
}

export function readInteger(
  errors: string[],
  path: string,
  value: unknown,
  min: number,
  max = Number.MAX_SAFE_INTEGER,
): number | undefined {
  if (
    Number.isInteger(value) &&
    (value as number) >= min &&
    (value as number) <= max
  )
    return value as number;
  errors.push(
    `${path}: expected a whole number from ${min}${max < Number.MAX_SAFE_INTEGER ? ` to ${max}` : ""}`,
  );
  return undefined;
}

export function readList(
  errors: string[],
  path: string,
  value: unknown,
  min = 1,
): unknown[] | undefined {
  if (Array.isArray(value) && value.length >= min) return value;
  errors.push(
    `${path}: expected a list with at least ${min} item${min === 1 ? "" : "s"}`,
  );
  return undefined;
}

export function readOptions(
  errors: string[],
  path: string,
  value: unknown,
): Option[] | undefined {
  const options = readList(errors, path, value, 2)?.map(
    (o, i): Option | undefined => {
      if (!isRecord(o)) {
        errors.push(`${path}[${i}]: expected an object`);
        return undefined;
      }
      const id = readText(errors, `${path}[${i}].id`, o.id);
      const text = readText(errors, `${path}[${i}].text`, o.text);
      return id && text ? { id, text } : undefined;
    },
  );
  if (!options || options.some((o) => !o)) return undefined;
  const ids = (options as Option[]).map((o) => o.id);
  if (new Set(ids).size !== ids.length)
    errors.push(`${path}: option ids must be unique`);
  return options as Option[];
}

export function readSegments(
  errors: string[],
  path: string,
  value: unknown,
): GapSegment[] | undefined {
  const segments = readList(errors, path, value)?.map(
    (s, i): GapSegment | undefined => {
      if (
        isRecord(s) &&
        typeof s.text === "string" &&
        s.text !== "" &&
        !("gap" in s)
      )
        return { text: s.text };
      if (isRecord(s) && !("text" in s)) {
        const gap = readInteger(errors, `${path}[${i}].gap`, s.gap, 1);
        return gap === undefined ? undefined : { gap };
      }
      errors.push(`${path}[${i}]: expected { "text": … } or { "gap": number }`);
      return undefined;
    },
  );
  return segments && segments.every((s) => s)
    ? (segments as GapSegment[])
    : undefined;
}

export function readWordLimit(
  errors: string[],
  path: string,
  value: unknown,
): WordLimit | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: required for typed answers`);
    return undefined;
  }
  const words = readInteger(errors, `${path}.words`, value.words, 1, 5);
  if (typeof value.numbers !== "boolean")
    errors.push(`${path}.numbers: expected true or false`);
  return words !== undefined && typeof value.numbers === "boolean"
    ? { words, numbers: value.numbers }
    : undefined;
}

/** Undefined when absent, null when present but invalid. */
export function readOptionalTitle(
  errors: string[],
  path: string,
  value: unknown,
) {
  if (value === undefined) return undefined;
  return readText(errors, `${path}.title`, value) ?? null;
}

/** Undefined when absent, null when present but invalid. */
export function readOptionalText(
  errors: string[],
  path: string,
  value: unknown,
) {
  if (value === undefined) return undefined;
  return readText(errors, path, value) ?? null;
}

export function readOrigin(
  errors: string[],
  value: unknown,
): Origin | undefined {
  if (!isRecord(value)) {
    errors.push(
      "origin: required (original or licensed content only, INVARIANTS I-5)",
    );
    return undefined;
  }
  if (value.kind === "original") {
    const author = readText(errors, "origin.author", value.author);
    if (author === undefined) return undefined;
    return value.note === undefined
      ? { kind: "original", author }
      : {
          kind: "original",
          author,
          note: readText(errors, "origin.note", value.note) ?? "",
        };
  }
  if (value.kind === "licensed") {
    const source = readText(errors, "origin.source", value.source);
    const license = readText(errors, "origin.license", value.license);
    const url = readOptionalText(errors, "origin.url", value.url);
    const attribution = readOptionalText(
      errors,
      "origin.attribution",
      value.attribution,
    );
    return source && license && url !== null && attribution !== null
      ? {
          kind: "licensed",
          source,
          license,
          ...(url && { url }),
          ...(attribution && { attribution }),
        }
      : undefined;
  }
  errors.push('origin.kind: expected "original" or "licensed"');
  return undefined;
}

export function readReview(
  errors: string[],
  path: string,
  value: unknown,
): { status: ReviewStatus } | undefined {
  const status = isRecord(value) ? value.status : undefined;
  if (REVIEW_STATUSES.includes(status as ReviewStatus))
    return { status: status as ReviewStatus };
  errors.push(`${path}.status: expected one of ${REVIEW_STATUSES.join(", ")}`);
  return undefined;
}
