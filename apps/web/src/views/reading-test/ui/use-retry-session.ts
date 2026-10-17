import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type ReadingEvent,
  type ReadingSession,
  type ReadingTest,
  type RetryProblem,
  SCORING_RULES_VERSION,
  currentResult,
  deviceHistory,
  deviceStorage,
  newSessionId,
  saveSession,
  settleStoredSessions,
  storageSnapshot,
  validateRetry,
} from "@/entities/reading";
import { useRouter } from "@/shared/i18n/navigation";
import { type Sessions, screenReducer } from "../model/screen-state";
import { useCommitFinished } from "./use-commit-finished";

/** What the retry screen shows, from the first render to its results. */
export type RetryScreenState =
  /** Before the device is read and the address is checked against its source. */
  | { status: "loading" }
  /** The address can't start a retry (READING_EXPERIENCE.md, Targeted practice). */
  | { status: "unavailable"; problem: RetryProblem }
  | {
      status: "active";
      session: ReadingSession;
      canSave: boolean;
      send: (event: ReadingEvent) => void;
    }
  | { status: "finishing" };

type Check =
  { ok: true; questions: number[] } | { ok: false; problem: RetryProblem };

// Storage is read on the client only; the server renders the loading frame.
const noSubscription = () => () => {};

/**
 * A retry of whole answer units of a test attempt (ADR-0009 §8), from its
 * address (`of`, `q`) to its results. The device is settled first; then the
 * address is validated against its source attempt and the source's record for
 * the current key revision (`keyRevision`; the key itself is not on this
 * page, ADR-0008 §2). A source without that record yet (never shown, or the
 * key or the rules changed since) goes to its results page, which writes it
 * and comes back to this address once (`rechecked`). The same retry in
 * progress resumes; any other is replaced by a new
 * session with its own id. Finishing commits a retry attempt and shows its
 * results.
 */
export function useRetrySession(
  test: ReadingTest,
  keyRevision: number,
  of: string | null,
  requested: string | null,
  /** Back from the source's results page, which wrote its record. */
  rechecked: boolean,
): RetryScreenState {
  const snapshot = useSyncExternalStore(
    noSubscription,
    () => storageSnapshot(test),
    () => null,
  );
  const [check, setCheck] = useState<Check>();
  const [state, dispatch] = useReducer(screenReducer, {});
  const router = useRouter();
  const settled = useRef<Promise<void>>(null);
  // The retry in progress resumes only when it is this address's retry.
  const stored = useMemo((): Sessions | undefined => {
    if (!snapshot || !check?.ok) return undefined;
    const retry = snapshot.retry;
    return retry?.status === "inProgress" &&
      retry.retry?.of === of &&
      sameNumbers(retry.retry.questions, check.questions)
      ? { current: retry }
      : {};
  }, [snapshot, check, of]);
  const sessions = stored && (state.local ?? stored);
  const current = sessions?.current;
  const finished = sessions?.finished;

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
        const records =
          source?.kind === "test" && source.testVersion === test.version
            ? await history.results(source)
            : [];
        const record = currentResult(records, {
          keyRevision,
          rulesVersion: SCORING_RULES_VERSION,
        })?.record;
        if (
          source?.kind === "test" &&
          source.testVersion === test.version &&
          !record &&
          !rechecked
        ) {
          const address = new URLSearchParams({
            attempt: source.id,
            retry: requested ?? "",
          });
          router.replace(`/reading/${test.id}/results?${address}`);
          return undefined;
        }
        return validateRetry(test, source, record, requested);
      })
      .then(
        (result) => {
          if (active && result) setCheck(result);
        },
        () => {
          if (active) setCheck({ ok: false, problem: "sourceMissing" });
        },
      );
    return () => {
      active = false;
    };
  }, [test, keyRevision, of, requested, rechecked, router]);

  // A valid address without its retry in progress starts one.
  useEffect(() => {
    if (!stored || current || finished || !check?.ok || !of) return;
    dispatch({
      type: "start",
      test,
      mode: "practice",
      now: Date.now(),
      sessionId: newSessionId(),
      retry: { of, questions: check.questions },
      stored,
    });
  }, [stored, current, finished, check, of, test]);

  // Keep every change on the device as it happens (ADR-0006 §2, ADR-0009 §8).
  useEffect(() => {
    const changed = state.local?.current ?? state.local?.finished;
    if (changed) saveSession(deviceStorage(), changed);
  }, [state.local]);

  useCommitFinished(test, finished, settled);

  const send = useCallback(
    (event: ReadingEvent) => {
      if (!stored) return;
      dispatch({ type: "event", test, event, now: Date.now(), stored });
    },
    [test, stored],
  );

  if (check && !check.ok)
    return { status: "unavailable", problem: check.problem };
  if (!snapshot || !current)
    return finished ? { status: "finishing" } : { status: "loading" };
  return {
    status: "active",
    session: current,
    canSave: snapshot.canSave,
    send,
  };
}

function sameNumbers(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((n) => b.includes(n));
}
