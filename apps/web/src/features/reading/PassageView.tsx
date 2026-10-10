import type { Passage } from "@/domain/reading/content";

/**
 * The passage, the screen's main object: approved passage typography, English
 * test content, sentences as stable targets (ADR-0007) for highlights and pins.
 */
export function PassageView({
  passage,
  bottomSpace,
}: {
  passage: Passage;
  /** Room under the text, so its last line can be scrolled above the sheet. */
  bottomSpace: string;
}) {
  return (
    <article
      lang="en"
      className="mx-auto max-w-measure pt-6 font-passage text-passage"
      style={{ paddingBottom: bottomSpace }}
    >
      <h1 className="font-sans text-heading-2 font-bold">{passage.title}</h1>
      {passage.paragraphs.map((paragraph) => (
        <p key={paragraph.id} className="mt-4">
          {paragraph.letter && (
            <span className="font-sans font-bold text-text-secondary">
              {paragraph.letter}{" "}
            </span>
          )}
          {paragraph.sentences.map((sentence) => (
            <span key={sentence.id} data-sentence={sentence.id}>
              {sentence.text}{" "}
            </span>
          ))}
        </p>
      ))}
    </article>
  );
}
