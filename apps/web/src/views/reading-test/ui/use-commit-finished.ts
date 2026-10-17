import { type RefObject, useEffect } from "react";
import {
  type ReadingSession,
  type ReadingTest,
  commitFinishedSession,
  deviceHistory,
  deviceStorage,
} from "@/entities/reading";
import { useRouter } from "@/shared/i18n/navigation";

/**
 * The one way out of a finished session, a test or a retry: after the device
 * has settled (`settled`), so that settling and finishing never commit side by
 * side, it is committed (its localStorage copy is removed only after a
 * durable commit), and its results page replaces the screen. A commit that
 * fails leaves the finished session in localStorage, where the results page
 * finds it and says that it is not saved (ADR-0009 §4, §9).
 */
export function useCommitFinished(
  test: ReadingTest,
  finished: ReadingSession | undefined,
  settled: RefObject<Promise<void> | null>,
) {
  const router = useRouter();
  useEffect(() => {
    if (!finished) return;
    let active = true;
    (settled.current ?? Promise.resolve())
      .then(() => deviceHistory())
      .then((history) =>
        commitFinishedSession(
          deviceStorage(),
          history,
          test,
          finished,
          Date.now(),
        ),
      )
      .finally(() => {
        if (active)
          router.replace(
            `/reading/${test.id}/results?attempt=${encodeURIComponent(finished.sessionId)}`,
          );
      });
    return () => {
      active = false;
    };
  }, [finished, test, router, settled]);
}
