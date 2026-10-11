"use client";

import { createContext, useContext } from "react";
import type { ReadingTest } from "../model/content";
import type { ReadingEvent, ReadingSession } from "../model/session";
import type { QuestionUnit } from "../model/units";

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
