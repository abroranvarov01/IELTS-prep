"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { ListeningTest } from "@/entities/listening";
import { useRouter } from "@/shared/i18n/navigation";
import { TestBar } from "./TestBar";
import { useListeningCheckSession } from "./use-check-session";
import { Workspace } from "./Workspace";

/**
 * The level check's Listening section (USER_FLOWS.md, The level check with
 * two sections; LISTENING_EXPERIENCE.md, The level check's Listening section
 * (M9)): the Listening screen in Practice, by removal (no Back, Forward,
 * slider, speed, replay or "Mark for review"), with the check's player, on
 * the form started by the intro. The intro opens it with `?start=<token>`
 * or `?resume=<token>`; opened with nothing in progress, it sends the
 * learner to the intro.
 */
export function LevelCheckSection({ form }: { form: ListeningTest }) {
  const params = useSearchParams();
  const start = params.get("start");
  const screen = useListeningCheckSession(
    form,
    start ?? params.get("resume") ?? "",
    start !== null,
  );
  const router = useRouter();

  useEffect(() => {
    if (screen.status === "none") router.replace("/level-check");
  }, [screen.status, router]);

  switch (screen.status) {
    case "loading":
    case "none":
    case "finishing":
      return <TestBar check />;
    case "active":
      return (
        <Workspace
          test={form}
          session={screen.session}
          send={screen.send}
          // The check is Practice: no clock.
          now={screen.session.startedAt}
          canSave={screen.canSave}
        />
      );
  }
}
