import { type RefObject, useEffect } from "react";
import {
  type ListeningSession,
  type ListeningTest,
  commitFinishedSession,
  deviceHistory,
} from "@/entities/listening";
import { useRouter } from "@/shared/i18n/navigation";
import { deviceStorage } from "@/shared/lib/device-storage";

/**
 * The way out of a session finished on this page (as Reading's): after the
 * device has settled (`settled`), so that settling and finishing never commit
 * side by side, it is committed (its localStorage copy is removed only after
 * a durable commit), and its results page replaces the screen. A commit that
 * fails leaves the finished session in localStorage, where the results page
 * finds it and says that it is not saved (ADR-0014 §3, ADR-0009 §9).
 */
export function useCommitFinished(
  test: ListeningTest,
  finished: ListeningSession | undefined,
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
            `/listening/${test.id}/results?attempt=${encodeURIComponent(finished.sessionId)}`,
          );
      });
    return () => {
      active = false;
    };
  }, [finished, test, router, settled]);
}
