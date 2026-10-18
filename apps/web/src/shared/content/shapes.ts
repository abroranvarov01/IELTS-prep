import {
  isRecord,
  readId,
  readInteger,
  readList,
  readOptionalText,
  readOptionalTitle,
  readOptions,
  readSegments,
  readText,
  readWordLimit,
} from "./parse";
import {
  type GapSegment,
  type Option,
  type WordLimit,
  gapNumbers,
} from "./types";

// The question layouts and assets shared by Listening and Reading
// (ADR-0012 §2, §3, §6): how a gap is answered, tables, flow charts,
// labelling on a picture, images and provenance. Structure only.

/** How the gaps of a completion group are answered (LISTENING_EXPERIENCE.md L7). */
export type GapAnswer =
  | { kind: "typed"; wordLimit: WordLimit }
  | { kind: "choose"; options: Option[]; allowRepeat: boolean };

/** Labelling may also be answered with the letters drawn on the picture. */
export type LabellingAnswer =
  GapAnswer | { kind: "marker"; allowRepeat: boolean };

export type TableShape = {
  title?: string;
  /** 2 to 4 header texts: wider tables do not fit a phone (ADR-0012 §2). */
  columns: string[];
  rowHeaders: boolean;
  rows: { cells: GapSegment[][] }[];
};

/** A linear flow chart: steps in order, each a list of lines. */
export type FlowChartShape = { title?: string; steps: GapSegment[][][] };

/** Drawn by the app over the image, at percentages of its size. */
export type Marker = {
  id: string;
  label: string;
  x: number;
  y: number;
  question?: number;
  option?: string;
};

export type LabellingShape = {
  title?: string;
  image: ImageAsset;
  markers: Marker[];
  questions: { number: number; prompt?: string }[];
  answer: LabellingAnswer;
};

export type Provenance = {
  /** A role or organisation, never a person's private data. */
  producedBy: string;
  method: "synthetic" | "recorded" | "drawn";
  tool?: string;
  voices?: { role: string; accent: string }[];
  license: string;
  sourceUrl?: string;
  attribution?: string;
  /** A reference to a consent or release record kept outside the repository. */
  consentRef?: string;
  /** YYYY-MM-DD */
  producedAt: string;
  note?: string;
};

export type ImageAsset = {
  src: string;
  mimeType: "image/svg+xml" | "image/webp";
  width: number;
  height: number;
  alt: string;
  description: string;
  bytes: number;
  sha256: string;
  provenance: Provenance;
};

const IMAGE_BUDGET = { "image/svg+xml": 100_000, "image/webp": 200_000 };
const MIN_WEBP_WIDTH = 1200;

// --- Readers -----------------------------------------------------------------

export function readGapAnswer(
  errors: string[],
  path: string,
  value: unknown,
): GapAnswer | undefined {
  if (isRecord(value) && value.kind === "typed") {
    const wordLimit = readWordLimit(
      errors,
      `${path}.wordLimit`,
      value.wordLimit,
    );
    return wordLimit && { kind: "typed", wordLimit };
  }
  if (isRecord(value) && value.kind === "choose") {
    const options = readOptions(errors, `${path}.options`, value.options);
    const allowRepeat = readBoolean(
      errors,
      `${path}.allowRepeat`,
      value.allowRepeat,
    );
    return options && allowRepeat !== undefined
      ? { kind: "choose", options, allowRepeat }
      : undefined;
  }
  errors.push(`${path}.kind: expected "typed" or "choose"`);
  return undefined;
}

export function readTable(
  errors: string[],
  path: string,
  value: Record<string, unknown>,
): TableShape | undefined {
  const title = readOptionalTitle(errors, path, value.title);
  const columns = allDefined(
    readList(errors, `${path}.columns`, value.columns, 2)?.map((c, i) =>
      readText(errors, `${path}.columns[${i}]`, c),
    ),
  );
  const rowHeaders = readBoolean(
    errors,
    `${path}.rowHeaders`,
    value.rowHeaders,
  );
  const rows = allDefined(
    readList(errors, `${path}.rows`, value.rows)?.map((row, i) => {
      const rowPath = `${path}.rows[${i}]`;
      if (!isRecord(row)) {
        errors.push(`${rowPath}: expected an object`);
        return undefined;
      }
      const cells = allDefined(
        readList(errors, `${rowPath}.cells`, row.cells)?.map((cell, j) =>
          readSegments(errors, `${rowPath}.cells[${j}]`, cell),
        ),
      );
      return cells && { cells };
    }),
  );
  if (!columns || rowHeaders === undefined || !rows || title === null)
    return undefined;
  return { ...(title && { title }), columns, rowHeaders, rows };
}

export function readFlowChart(
  errors: string[],
  path: string,
  value: Record<string, unknown>,
): FlowChartShape | undefined {
  const title = readOptionalTitle(errors, path, value.title);
  const steps = allDefined(
    readList(errors, `${path}.steps`, value.steps, 2)?.map((step, i) =>
      allDefined(
        readList(errors, `${path}.steps[${i}]`, step)?.map((line, j) =>
          readSegments(errors, `${path}.steps[${i}][${j}]`, line),
        ),
      ),
    ),
  );
  if (!steps || title === null) return undefined;
  return { ...(title && { title }), steps };
}

export function readLabelling(
  errors: string[],
  path: string,
  value: Record<string, unknown>,
): LabellingShape | undefined {
  const title = readOptionalTitle(errors, path, value.title);
  const image = readImage(errors, `${path}.image`, value.image);
  const markers = allDefined(
    readList(errors, `${path}.markers`, value.markers)?.map((m, i) =>
      readMarker(errors, `${path}.markers[${i}]`, m),
    ),
  );
  const questions = allDefined(
    readList(errors, `${path}.questions`, value.questions)?.map((q, i) => {
      const qPath = `${path}.questions[${i}]`;
      if (!isRecord(q)) {
        errors.push(`${qPath}: expected an object`);
        return undefined;
      }
      const number = readInteger(errors, `${qPath}.number`, q.number, 1);
      const prompt = readOptionalText(errors, `${qPath}.prompt`, q.prompt);
      return number !== undefined && prompt !== null
        ? { number, ...(prompt && { prompt }) }
        : undefined;
    }),
  );
  const answer =
    isRecord(value.answer) && value.answer.kind === "marker"
      ? (() => {
          const allowRepeat = readBoolean(
            errors,
            `${path}.answer.allowRepeat`,
            (value.answer as Record<string, unknown>).allowRepeat,
          );
          return allowRepeat === undefined
            ? undefined
            : ({ kind: "marker", allowRepeat } as const);
        })()
      : readGapAnswer(errors, `${path}.answer`, value.answer);
  if (!image || !markers || !questions || !answer || title === null)
    return undefined;
  return { ...(title && { title }), image, markers, questions, answer };
}

function readMarker(
  errors: string[],
  path: string,
  value: unknown,
): Marker | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  const id = readId(errors, `${path}.id`, value.id);
  const label = readText(errors, `${path}.label`, value.label);
  const x = readPercent(errors, `${path}.x`, value.x);
  const y = readPercent(errors, `${path}.y`, value.y);
  const question =
    value.question === undefined
      ? undefined
      : readInteger(errors, `${path}.question`, value.question, 1);
  const option =
    value.option === undefined
      ? undefined
      : readText(errors, `${path}.option`, value.option);
  if ((question === undefined) === (option === undefined))
    errors.push(`${path}: expected a question number or an option, not both`);
  if (!id || !label || x === undefined || y === undefined) return undefined;
  if (question === undefined && option === undefined) return undefined;
  return {
    id,
    label,
    x,
    y,
    ...(question !== undefined && { question }),
    ...(option !== undefined && { option }),
  };
}

export function readImage(
  errors: string[],
  path: string,
  value: unknown,
): ImageAsset | undefined {
  if (!isRecord(value)) {
    errors.push(`${path}: expected an object`);
    return undefined;
  }
  const src = readText(errors, `${path}.src`, value.src);
  const mimeType =
    value.mimeType === "image/svg+xml" || value.mimeType === "image/webp"
      ? value.mimeType
      : undefined;
  if (!mimeType)
    errors.push(`${path}.mimeType: expected "image/svg+xml" or "image/webp"`);
  const width = readInteger(errors, `${path}.width`, value.width, 1);
  const height = readInteger(errors, `${path}.height`, value.height, 1);
  const alt = readText(errors, `${path}.alt`, value.alt);
  const description = readText(
    errors,
    `${path}.description`,
    value.description,
  );
  const bytes = readInteger(errors, `${path}.bytes`, value.bytes, 1);
  const sha256 = readSha256(errors, `${path}.sha256`, value.sha256);
  const provenance = readProvenance(
    errors,
    `${path}.provenance`,
    value.provenance,
  );
  if (
    !src ||
    !mimeType ||
    width === undefined ||
    height === undefined ||
    !alt ||
    !description ||
    bytes === undefined ||
    !sha256 ||
    !provenance
  )
    return undefined;
  checkHashedName(
    errors,
    `${path}.src`,
    src,
    sha256,
    mimeType === "image/svg+xml" ? "svg" : "webp",
  );
  if (bytes > IMAGE_BUDGET[mimeType])
    errors.push(
      `${path}.bytes: over the ${IMAGE_BUDGET[mimeType] / 1000} KB budget for ${mimeType}`,
    );
  if (mimeType === "image/webp" && width < MIN_WEBP_WIDTH)
    errors.push(
      `${path}.width: a WebP image needs at least ${MIN_WEBP_WIDTH} px`,
    );
  return {
    src,
    mimeType,
    width,
    height,
    alt,
    description,
    bytes,
    sha256,
    provenance,
  };
}

export function readProvenance(
  errors: string[],
  path: string,
  value: unknown,
  { voices: needsVoices = false } = {},
): Provenance | undefined {
  if (!isRecord(value)) {
    errors.push(
      `${path}: required (who made it, how, and under which licence)`,
    );
    return undefined;
  }
  const producedBy = readText(errors, `${path}.producedBy`, value.producedBy);
  const method =
    value.method === "synthetic" ||
    value.method === "recorded" ||
    value.method === "drawn"
      ? value.method
      : undefined;
  if (!method)
    errors.push(`${path}.method: expected "synthetic", "recorded" or "drawn"`);
  const license = readText(errors, `${path}.license`, value.license);
  const producedAt =
    typeof value.producedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.producedAt)
      ? value.producedAt
      : undefined;
  if (!producedAt) errors.push(`${path}.producedAt: expected YYYY-MM-DD`);
  const voices =
    value.voices === undefined && !needsVoices
      ? undefined
      : allDefined(
          readList(errors, `${path}.voices`, value.voices)?.map((v, i) => {
            if (!isRecord(v)) {
              errors.push(`${path}.voices[${i}]: expected an object`);
              return undefined;
            }
            const role = readText(errors, `${path}.voices[${i}].role`, v.role);
            const accent = readText(
              errors,
              `${path}.voices[${i}].accent`,
              v.accent,
            );
            return role && accent ? { role, accent } : undefined;
          }),
        );
  const optional = {
    tool: readOptionalText(errors, `${path}.tool`, value.tool),
    sourceUrl: readOptionalText(errors, `${path}.sourceUrl`, value.sourceUrl),
    attribution: readOptionalText(
      errors,
      `${path}.attribution`,
      value.attribution,
    ),
    consentRef: readOptionalText(
      errors,
      `${path}.consentRef`,
      value.consentRef,
    ),
    note: readOptionalText(errors, `${path}.note`, value.note),
  };
  if (
    !producedBy ||
    !method ||
    !license ||
    !producedAt ||
    (needsVoices && !voices) ||
    Object.values(optional).some((v) => v === null)
  )
    return undefined;
  const present = Object.fromEntries(
    Object.entries(optional).filter(([, v]) => v !== undefined),
  ) as Partial<Record<keyof typeof optional, string>>;
  return {
    producedBy,
    method,
    license,
    producedAt,
    ...(voices && { voices }),
    ...present,
  };
}

export function readSha256(
  errors: string[],
  path: string,
  value: unknown,
): string | undefined {
  if (typeof value === "string" && /^[0-9a-f]{64}$/.test(value)) return value;
  errors.push(`${path}: expected 64 lowercase hex digits`);
  return undefined;
}

// --- Checks ------------------------------------------------------------------

/** A file's name carries its hash, so a changed file has a new address (ADR-0013 §1). */
export function checkHashedName(
  errors: string[],
  path: string,
  src: string,
  sha256: string,
  extension: string,
) {
  const match =
    /^([a-z0-9]+(?:-[a-z0-9]+)*)\.([0-9a-f]{12})\.([a-z0-9]+)$/.exec(src);
  if (!match)
    errors.push(
      `${path}: expected "<name>.<first 12 hex of sha256>.${extension}"`,
    );
  else if (match[2] !== sha256.slice(0, 12))
    errors.push(`${path}: the name's hash does not match sha256`);
  else if (match[3] !== extension)
    errors.push(`${path}: expected the extension .${extension}`);
}

export function checkTable(errors: string[], path: string, table: TableShape) {
  if (table.columns.length > 4)
    errors.push(`${path}.columns: at most 4 columns fit a phone`);
  table.rows.forEach((row, i) => {
    if (row.cells.length !== table.columns.length)
      errors.push(
        `${path}.rows[${i}].cells: expected one cell per column (${table.columns.length})`,
      );
  });
  if (tableNumbers(table).length === 0)
    errors.push(`${path}.rows: have no gap`);
}

export function checkFlowChart(
  errors: string[],
  path: string,
  chart: FlowChartShape,
) {
  if (chart.steps.length > 12) errors.push(`${path}.steps: at most 12 steps`);
  if (flowChartNumbers(chart).length === 0)
    errors.push(`${path}.steps: have no gap`);
}

/**
 * Markers carry question numbers (each question exactly once) or, when the
 * letters on the picture are the options, option letters; then every
 * question names its place (ADR-0012 §2).
 */
export function checkLabelling(
  errors: string[],
  path: string,
  shape: LabellingShape,
) {
  const ids = shape.markers.map((m) => m.id);
  if (new Set(ids).size !== ids.length)
    errors.push(`${path}.markers: marker ids must be unique`);
  if (shape.answer.kind === "marker") {
    if (shape.markers.some((m) => m.option === undefined))
      errors.push(`${path}.markers: every marker needs an option letter`);
    const letters = shape.markers.flatMap((m) => (m.option ? [m.option] : []));
    if (new Set(letters).size !== letters.length)
      errors.push(`${path}.markers: option letters must be unique`);
    shape.questions.forEach((q, i) => {
      if (!q.prompt)
        errors.push(
          `${path}.questions[${i}].prompt: required when the picture shows letters`,
        );
    });
    return;
  }
  if (shape.markers.some((m) => m.question === undefined))
    errors.push(`${path}.markers: every marker needs a question number`);
  const marked = shape.markers.flatMap((m) =>
    m.question === undefined ? [] : [m.question],
  );
  const asked = shape.questions.map((q) => q.number);
  if (
    [...marked].sort((a, b) => a - b).join() !==
    [...asked].sort((a, b) => a - b).join()
  )
    errors.push(`${path}.markers: one marker for each question, and no other`);
}

export function tableNumbers(table: TableShape): number[] {
  return table.rows.flatMap((row) => row.cells.flatMap(gapNumbers));
}

export function flowChartNumbers(chart: FlowChartShape): number[] {
  return chart.steps.flatMap((step) => step.flatMap(gapNumbers));
}

/** The option ids a labelling or completion answer accepts, or undefined for typed answers. */
export function answerOptionIds(
  answer: LabellingAnswer,
  markers: Marker[] = [],
): string[] | undefined {
  if (answer.kind === "typed") return undefined;
  if (answer.kind === "choose") return answer.options.map((o) => o.id);
  return markers.flatMap((m) => (m.option ? [m.option] : []));
}

/**
 * What an SVG must not contain: it is shown with <img>, where nothing runs,
 * and the validator also refuses anything that could (ADR-0012 §6).
 */
export function unsafeSvgParts(text: string): string[] {
  const rules: [string, RegExp][] = [
    ["a script", /<script\b/i],
    ["an event handler", /\son[a-z]+\s*=/i],
    ["foreignObject", /<foreignObject\b/i],
    ["a link to another file", /\bhref\s*=\s*["'](?!#)/i],
    ["a url() to another file", /url\(\s*["']?(?!#)/i],
  ];
  return rules
    .filter(([, pattern]) => pattern.test(text))
    .map(([name]) => name);
}

// --- Helpers -----------------------------------------------------------------

function readBoolean(errors: string[], path: string, value: unknown) {
  if (typeof value === "boolean") return value;
  errors.push(`${path}: expected true or false`);
  return undefined;
}

function readPercent(errors: string[], path: string, value: unknown) {
  if (typeof value === "number" && value >= 0 && value <= 100) return value;
  errors.push(`${path}: expected a number from 0 to 100`);
  return undefined;
}

function allDefined<T>(list: (T | undefined)[] | undefined): T[] | undefined {
  return list && list.every((x) => x !== undefined) ? (list as T[]) : undefined;
}
