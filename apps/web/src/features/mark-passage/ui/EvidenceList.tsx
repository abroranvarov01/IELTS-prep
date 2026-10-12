"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { unitOf, useReading } from "@/entities/reading";

/**
 * "Your evidence": the sentences pinned to a question, in passage order, under
 * its answer (READING_EXPERIENCE.md, Pin Evidence). Never says whether a pin
 * is right; that is review (M5).
 */
export function EvidenceList({
  number,
  onShow,
}: {
  number: number;
  onShow: (sentenceId: string) => void;
}) {
  const t = useTranslations("reading");
  const { test, units, session, send } = useReading();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pinned = session.pins[number] ?? [];
  const unit = unitOf(units, number);
  const passage = unit && test.passages[unit.passageNumber - 1];
  if (!passage || pinned.length === 0) return null;

  // Paragraphs without letters are named by their position.
  const quotes = passage.paragraphs.flatMap((paragraph, index) =>
    paragraph.sentences
      .filter((sentence) => pinned.includes(sentence.id))
      .map((sentence) => ({
        sentence,
        paragraph: paragraph.letter ?? String(index + 1),
      })),
  );
  const remove = (sentenceId: string) => {
    send({ type: "unpin", number, sentenceId });
    // The removed quote held focus; keep it nearby.
    if (pinned.length > 1) headingRef.current?.focus();
    else document.getElementById("question-heading")?.focus();
  };
  const action =
    "inline-flex min-h-12 items-center font-medium underline underline-offset-4";

  return (
    <div className="mt-6">
      <h3
        ref={headingRef}
        tabIndex={-1}
        className="font-bold focus:outline-none"
      >
        {t("evidence.title")}
      </h3>
      <ul className="mt-2 space-y-2">
        {quotes.map(({ sentence, paragraph }) => (
          <li
            key={sentence.id}
            className="rounded-md bg-surface-warm px-4 py-3"
          >
            <p className="text-meta text-text-secondary">
              {t("evidence.paragraph", { letter: paragraph })}
            </p>
            <blockquote
              id={`evidence-${number}-${sentence.id}`}
              lang="en"
              className="mt-1 font-passage text-passage"
            >
              {sentence.text}
            </blockquote>
            <div className="flex flex-wrap gap-x-4">
              <button
                type="button"
                aria-describedby={`evidence-${number}-${sentence.id}`}
                onClick={() => onShow(sentence.id)}
                className={action}
              >
                {t("evidence.show")}
              </button>
              <button
                type="button"
                aria-describedby={`evidence-${number}-${sentence.id}`}
                onClick={() => remove(sentence.id)}
                className={action}
              >
                {t("evidence.remove")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
