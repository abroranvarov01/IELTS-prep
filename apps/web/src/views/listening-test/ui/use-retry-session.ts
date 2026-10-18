"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LISTENING_SCORING_RULES_VERSION,
  type ListeningEvent,
  type ListeningSession,
  type ListeningTest,
  type RetryProblem,
  apply,
  currentResult,
  deviceHistory,
  loadSessions,
  saveSession,
  settleStoredSessions,
  startSession,
  validateRetry,
} from "@/entities/listening";
import { useRouter } from "@/shared/i18n/navigation";
import { deviceStorage, newSessionId } from "@/shared/lib/device-storage";
import { useCommitFinished } from "./use-commit-finished";

/** What the retry screen shows, from the first render to its results. */
export type RetryScreenState =
  /** Before the device is read and the address is checked against its source. */
  | { status: "loading" }
  /** The address can't start a retry (LISTENING_EXPERIENCE.md, Targeted practice (M9)). */
  | { status: "unavailable"; problem: RetryProblem }
  | {
      status: "active";
      session: ListeningSession;
      canSave: boolean;
      send: (event: ListeningEvent) => void;
    }
  | { status: "finishing" };

type Started = { session: ListeningSession; canSave: boolean };

/**
 * A retry of whole answer units of a test attempt (as Reading's,
 * ADR-0009 §8), from its address (`of`, `q`) to its results. The device is
 * settled first; then the address is validated against its source attempt
 * and the source's record for the current key revision (`keyRevision`; the
 * key itself is not on this page). A source without that record yet goes to
 * its results page, which writes it and comes back to this address once
 * (`rechecked`). The same retry in progress resumes; any other is replaced
 * by a new session with its own id. Finishing commits a retry attempt and
 * shows its results.
 */
export function useRetrySession(
  test: ListeningTest,
  keyRevision: number,
  of: string | null,
  requested: string | null,
  /** Back from the source's results page, which wrote its record. */
  rechecked: boolean,
): RetryScreenState {
  const [problem, setProblem] = useState<RetryProblem>();
  const [started, setStarted] = useState<Started>();
  const router = useRouter();
  const settled = useRef<Promise<void>>(null);

  useEffect(() => {
    let active = true;
    const settling = deviceHistory().then(async (history) => {
      await settleStoredSessions(deviceStorage(), history, test, Date.now());
      return history;
    });
    settled.current = settling.then(
      () => undefined,
      () => undefined,
    );
    settling
      .then(async (history) => {
        const source = (await history.read(test)).attempts.find(
          (a) => a.id === of,
        );
        const current =
          source?.kind === "test" && source.testVersion === test.version
            ? source
            : undefined;
        const record =
          current &&
          currentResult(await history.results(test, current), {
            keyRevision,
            rulesVersion: LISTENING_SCORING_RULES_VERSION,
          })?.record;
        if (current && !record && !rechecked) {
          const address = new URLSearchParams({
            attempt: current.id,
            retry: requested ?? "",
          });
          router.replace(`/listening/${test.id}/results?${address}`);
          return undefined;
        }
        return validateRetry(test, source, record, requested);
      })
      .then(
        (check) => {
          if (!active || !check) return;
          if (!check.ok || !of) {
            setProblem(check.ok ? "notAllowed" : check.problem);
            return;
          }
          // This address's retry in progress resumes; anything else starts anew.
          const storage = deviceStorage();
          const stored = loadSessions(storage, test).retry;
          const session =
            stored?.status === "inProgress" &&
            stored.retry?.of === of &&
            sameNumbers(stored.retry.questions, check.questions)
              ? stored
              : startSession(test, "practice", Date.now(), newSessionId(), {
                  of,
                  questions: check.questions,
                });
          setStarted({ session, canSave: saveSession(storage, test, session) });
        },
        () => {
          if (active) setProblem("sourceMissing");
        },
      );
    return () => {
      active = false;
    };
  }, [test, keyRevision, of, requested, rechecked, router]);

  // The latest session, so a change is applied and kept at once.
  const latest = useRef(started?.session);
  useEffect(() => {
    latest.current = started?.session;
  });

  const send = useCallback(
    (event: ListeningEvent) => {
      const base = latest.current;
      if (!base) return;
      const next = apply(base, test, event, Date.now());
      if (next === base) return;
      latest.current = next;
      const canSave = saveSession(deviceStorage(), test, next);
      setStarted({ session: next, canSave });
    },
    [test],
  );

  const session = started?.session;
  const finished = session?.status === "finished" ? session : undefined;
  useCommitFinished(test, finished, settled);

  if (problem) return { status: "unavailable", problem };
  if (finished) return { status: "finishing" };
  if (!session || !started) return { status: "loading" };
  return { status: "active", session, canSave: started.canSave, send };
}

function sameNumbers(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((n) => b.includes(n));
}
