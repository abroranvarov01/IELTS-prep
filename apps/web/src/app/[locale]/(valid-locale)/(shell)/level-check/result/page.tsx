import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { readGoal } from "@/entities/goal";
import {
  levelCheckListeningChecking,
  levelCheckListeningForm,
} from "@/entities/listening/forms.server";
import { levelCheckForm, levelCheckKey } from "@/entities/reading/forms.server";
import { LevelCheckResult } from "@/views/level-check";

// The level check's result, inside the shell. The forms' keys (and the
// Listening transcript the key pins) are read here, on the server, and
// passed to this page only (ADR-0008 §2, ADR-0014 §6).
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("levelCheck");
  return { title: t("result.titleBoth") };
}

export default function LevelCheckResultPage() {
  return (
    // The attempt is chosen by the address and read from the device; the
    // Academic-style line depends on the goal cookie.
    <Suspense>
      <ResultFromCookies />
    </Suspense>
  );
}

async function ResultFromCookies() {
  return (
    <LevelCheckResult
      reading={{ form: levelCheckForm(), answerKey: levelCheckKey() }}
      listening={{
        form: levelCheckListeningForm(),
        answerKey: levelCheckListeningChecking().key,
        transcript: levelCheckListeningChecking().transcript,
      }}
      academicNote={readGoal(await cookies()).examType === "general"}
    />
  );
}
