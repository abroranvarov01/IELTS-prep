"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import { useReading } from "@/entities/reading";
import {
  PassageView,
  SentenceActions,
  usePassageMarks,
} from "@/features/mark-passage";
import { useIsDesktop } from "@/shared/ui/use-is-desktop";
import { SHEET_HEIGHT, SkipToQuestion } from "@/widgets/reading-layout";
import { ExamTimer } from "./ExamTimer";
import { QuestionBar } from "./QuestionBar";
import { QuestionColumn } from "./QuestionColumn";
import { QuestionSheet } from "./QuestionSheet";
import { TestBar } from "./TestBar";
import { usePassagePosition } from "./use-passage-position";

/**
 * A test in progress, laid out for the screen: on phones and tablets the
 * passage with the question sheet; on desktop the passage and the questions
 * side by side with the navigator bar (READING_EXPERIENCE.md, M4).
 */
export function TestWorkspace({ canSave }: { canSave: boolean }) {
  const t = useTranslations("reading");
  const { test, session, send } = useReading();
  const isDesktop = useIsDesktop();
  // The passage scrolls in its column on desktop, with the page on phones.
  const columnRef = useRef<HTMLElement>(null);
  const passage = test.passages[session.view.passage - 1] ?? test.passages[0];
  const goTo = usePassagePosition(columnRef, isDesktop);
  // The passage ref is taken apart: an object whose field reaches `ref` would
  // count as a ref, and its other fields could not be read while rendering.
  const { passageRef, ...marks } = usePassageMarks(passage);

  // "Show in passage" on a phone first lowers a raised sheet.
  const showSentence = (id: string) => {
    if (!isDesktop && session.view.sheet === "expanded")
      send({ type: "setView", view: { sheet: "partial" } });
    marks.show(id);
  };

  if (!passage) return null;
  const skipLink = <SkipToQuestion />;
  const testBar = (
    <TestBar confirmExit={session.mode === "exam"}>
      <span className="font-medium">
        {t("passageOf", {
          number: passage.number,
          total: test.passages.length,
        })}
      </span>
      {session.mode === "exam" && <ExamTimer />}
    </TestBar>
  );
  const passageArea = (
    <>
      {!canSave && (
        <p role="status" className="mx-auto max-w-measure pt-4 font-medium">
          {t("storage.unavailable")}
        </p>
      )}
      <PassageView
        ref={passageRef}
        passage={passage}
        bottomSpace={
          isDesktop
            ? "2rem"
            : `calc(${SHEET_HEIGHT[session.view.sheet]} + 1rem)`
        }
        highlights={marks.highlights}
        selected={marks.selected}
        focusable={marks.focusable}
        pins={marks.pins}
      />
    </>
  );
  const liveRegion = (
    <p aria-live="polite" className="sr-only">
      {marks.announcement}
    </p>
  );
  const sentenceActions = marks.actions && (
    <SentenceActions
      {...marks.actions}
      bottom={
        isDesktop
          ? undefined
          : `calc(${SHEET_HEIGHT[session.view.sheet]} + 0.5rem)`
      }
    />
  );

  // Desktop: passage and questions side by side, each scrolling on its own,
  // the navigator bar along the bottom (READING_EXPERIENCE.md, M4).
  if (isDesktop) {
    return (
      <div className="flex h-dvh flex-col">
        {skipLink}
        {testBar}
        <div className="grid min-h-[0] flex-1 grid-cols-[55fr_45fr] grid-rows-[minmax(0,1fr)]">
          <main
            id="main"
            ref={columnRef}
            className="relative overflow-y-auto px-gutter"
          >
            {passageArea}
            {sentenceActions}
          </main>
          <QuestionColumn showSentence={showSentence} />
        </div>
        <QuestionBar goTo={goTo} />
        {liveRegion}
      </div>
    );
  }
  return (
    <>
      {skipLink}
      {testBar}
      <main id="main" className="px-gutter">
        {passageArea}
      </main>
      {liveRegion}
      {sentenceActions}
      <QuestionSheet goTo={goTo} showSentence={showSentence} />
    </>
  );
}
