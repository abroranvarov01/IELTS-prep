import {
  type LevelCheckState,
  parseLevelCheckState,
  serializeLevelCheckState,
} from "../model/state";

// The check's state cookie (ADR-0011 §5): written only by Server Actions,
// read by server components; the cookie store is a parameter, as for the
// goal (entities/goal/api/goal-cookie.ts).
export const LEVEL_CHECK_COOKIE = "ielts-prep-level-check";

// 400 days: the longest Chrome keeps a cookie. Refreshed on every write.
const MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

type CookieReader = { get(name: string): { value: string } | undefined };
type CookieWriter = {
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      path: string;
      maxAge: number;
    },
  ): unknown;
};

export function readLevelCheckState(cookies: CookieReader): LevelCheckState {
  return parseLevelCheckState(cookies.get(LEVEL_CHECK_COOKIE)?.value);
}

/** Only Server Actions may write cookies (Next.js). */
export function saveLevelCheckState(
  cookies: CookieWriter,
  state: LevelCheckState,
): void {
  cookies.set(LEVEL_CHECK_COOKIE, serializeLevelCheckState(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}
