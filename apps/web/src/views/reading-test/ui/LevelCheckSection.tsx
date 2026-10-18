"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import {
  ReadingContext,
  type ReadingTest,
  questionUnits,
} from "@/entities/reading";
import { useRouter } from "@/shared/i18n/navigation";
import { TestBar } from "./TestBar";
import { TestWorkspace } from "./TestWorkspace";
import { useCheckSession } from "./use-check-session";

/**
 * A level-check section (USER_FLOWS.md, Level check flows (M7); ADR-0011 §2):
 * the Reading test screen in Practice, by removal (no timer, flag, pins or
 * evidence), on the form started by the intro. The intro opens it with
 * `?start=<token>` (start a session here if the device kept nothing) or
 * `?resume=<token>`; a new token reads the device again. Opened with nothing
 * in progress, it sends the learner to the intro.
 */
export function LevelCheckSection({ form }: { form: ReadingTest }) {
  const params = useSearchParams();
  const start = params.get("start");
  const screen = useCheckSession(
    form,
    start ?? params.get("resume") ?? "",
    start !== null,
  );
  const units = useMemo(() => questionUnits(form), [form]);
  const router = useRouter();

  useEffect(() => {
    if (screen.status === "none") router.replace("/level-check");
  }, [screen.status, router]);

  switch (screen.status) {
    case "loading":
    case "none":
    case "finishing":
      return <TestBar />;
    case "active":
      return (
        <ReadingContext.Provider
          value={{
            test: form,
            units,
            session: screen.session,
            send: screen.send,
            variant: "check",
          }}
        >
          <TestWorkspace canSave={screen.canSave} />
        </ReadingContext.Provider>
      );
  }
}
