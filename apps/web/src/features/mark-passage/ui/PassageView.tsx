import { useLocale, useTranslations } from "next-intl";
import type { Passage } from "@/entities/reading";
import { PinIcon } from "./SentenceActions";

/**
 * The passage, the screen's main object: approved passage typography, English
 * test content. Each sentence is a stable target (ADR-0007) for highlights and
 * pins: plain text for reading, focusable for the keyboard with one Tab stop
 * (roving tabindex), and selected by tap, click or Enter. Sentences pinned to
 * the current question carry a marker with its number.
 */
export function PassageView({
  passage,
  bottomSpace,
  highlights,
  selected,
  focusable,
  pins,
}: {
  passage: Passage;
  /** Room under the text, so its last line can be scrolled above the sheet. */
  bottomSpace: string;
  highlights: ReadonlySet<string>;
  selected: string | null;
  /** The sentence that takes the passage's one Tab stop. */
  focusable: string;
  /** The current question's evidence, if Pin Evidence is offered. */
  pins: { number: number; sentenceIds: ReadonlySet<string> } | null;
}) {
  const t = useTranslations("reading");
  const locale = useLocale();
  const hintId = `passage-hint-${passage.id}`;

  return (
    <article
      lang="en"
      className="mx-auto max-w-measure pt-6 font-passage text-passage"
      style={{ paddingBottom: bottomSpace }}
    >
      <h1 className="font-sans text-heading-2 font-bold">{passage.title}</h1>
      <span id={hintId} lang={locale} className="sr-only">
        {t("passage.label")}
      </span>
      {passage.paragraphs.map((paragraph) => (
        <p key={paragraph.id} className="mt-4">
          {paragraph.letter && (
            <span className="font-sans font-bold text-text-secondary">
              {paragraph.letter}{" "}
            </span>
          )}
          {paragraph.sentences.map((sentence) => (
            <span key={sentence.id}>
              <span
                data-sentence={sentence.id}
                tabIndex={sentence.id === focusable ? 0 : -1}
                aria-describedby={
                  sentence.id === focusable ? hintId : undefined
                }
                // A focused sentence is never hidden under the bars (WCAG 2.4.11).
                style={{ scrollMarginBottom: bottomSpace }}
                className={`scroll-mt-16 cursor-pointer rounded-sm ${
                  sentence.id === selected
                    ? "bg-brand-blush underline decoration-ink decoration-2 underline-offset-4"
                    : ""
                }`}
              >
                {pins?.sentenceIds.has(sentence.id) && (
                  <span className="me-1 inline-flex items-center gap-1 rounded-full border border-ink bg-surface-base px-2 font-sans text-meta font-bold">
                    <PinIcon className="size-[0.875rem]" />
                    <span aria-hidden="true">{pins.number}</span>
                    <span lang={locale} className="sr-only">
                      {t("mark.pinned", { number: pins.number })}
                    </span>
                  </span>
                )}
                {highlights.has(sentence.id) ? (
                  <mark className="border-b-2 border-border-control bg-highlight text-ink">
                    {sentence.text}
                  </mark>
                ) : (
                  sentence.text
                )}
              </span>{" "}
            </span>
          ))}
        </p>
      ))}
    </article>
  );
}
