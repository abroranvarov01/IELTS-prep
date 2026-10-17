"use client";

import { useTranslations } from "next-intl";
import { visibleElementById } from "@/shared/ui/visible-element";

/**
 * "Skip to the question", the first focusable element of the Reading screens
 * (READING_EXPERIENCE.md, Mobile reading screen: accessibility). It moves
 * focus to the visible question heading, not to a hidden copy of an earlier
 * page with the same id.
 */
export function SkipToQuestion() {
  const t = useTranslations("reading");
  return (
    <a
      href="#question-heading"
      onClick={(event) => {
        const heading = visibleElementById("question-heading");
        if (!heading) return;
        event.preventDefault();
        heading.focus();
      }}
      className="sr-only focus:not-sr-only focus:block focus:px-gutter focus:py-3 focus:font-bold focus:underline"
    >
      {t("skipToQuestion")}
    </a>
  );
}
