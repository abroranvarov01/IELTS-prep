"use client";

import { createContext, useContext } from "react";
import type { ListeningTest } from "../model/content";
import type { ListeningEvent, ListeningSession } from "../model/session";
import type { QuestionUnit } from "../model/units";

export type ListeningContextValue = {
  test: ListeningTest;
  units: QuestionUnit[];
  session: ListeningSession;
  send: (event: ListeningEvent) => void;
};

/** The running session, shared by the questions, the bars and the navigator (ADR-0013 §3). */
export const ListeningContext = createContext<ListeningContextValue | null>(
  null,
);

export function useListening(): ListeningContextValue {
  const value = useContext(ListeningContext);
  if (!value) throw new Error("useListening needs a ListeningContext provider");
  return value;
}
