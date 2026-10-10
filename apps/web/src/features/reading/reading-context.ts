"use client";

import { createContext, useContext } from "react";
import type { ReadingTest } from "@/domain/reading/content";
import type { ReadingEvent, ReadingSession } from "@/domain/reading/session";
import type { QuestionUnit } from "@/domain/reading/units";

export type ReadingContextValue = {
  test: ReadingTest;
  units: QuestionUnit[];
  session: ReadingSession;
  send: (event: ReadingEvent) => void;
};

/** The running session, shared by the passage, the sheet and the navigator (ADR-0006). */
export const ReadingContext = createContext<ReadingContextValue | null>(null);

export function useReading(): ReadingContextValue {
  const value = useContext(ReadingContext);
  if (!value) throw new Error("useReading needs a ReadingContext provider");
  return value;
}
