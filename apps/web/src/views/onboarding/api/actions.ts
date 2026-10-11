"use server";

import { hasLocale } from "next-intl";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isExamType, isTargetBand, readGoal, saveGoal } from "@/entities/goal";
import { routing } from "@/shared/i18n/routing";

// Each answer is saved the moment it is given, then the next step opens
// (USER_FLOWS.md). The flow moves on even if the browser drops the cookie.
// A value that is not an answer is ignored and the same step opens again.

export async function answerExamType(locale: string, form: FormData) {
  const answer = form.get("examType");
  if (!isExamType(answer)) redirect(`/${knownLocale(locale)}/start/exam`);
  const cookieStore = await cookies();
  saveGoal(cookieStore, { ...readGoal(cookieStore), examType: answer });
  redirect(`/${knownLocale(locale)}/start/band`);
}

export async function answerTargetBand(locale: string, form: FormData) {
  const answer = form.get("targetBand");
  if (!isTargetBand(answer)) redirect(`/${knownLocale(locale)}/start/band`);
  const cookieStore = await cookies();
  saveGoal(cookieStore, { ...readGoal(cookieStore), targetBand: answer });
  redirect(`/${knownLocale(locale)}/start/level-check`);
}

// The locale is a bound argument, so it comes from the client: never trust it.
function knownLocale(locale: string) {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}
