import { type Goal, parseGoal, serializeGoal } from "@/domain/goal";

// The guest's goal lives in one server-managed cookie (ADR-0003). These take
// the cookie store as a parameter: `await cookies()` in server components and
// Server Actions, `request.cookies` in proxy.ts.
export const GOAL_COOKIE = "goal";

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

export function readGoal(cookies: CookieReader): Goal {
  return parseGoal(cookies.get(GOAL_COOKIE)?.value);
}

/** Only Server Actions may write cookies (Next.js). */
export function saveGoal(cookies: CookieWriter, goal: Goal): void {
  cookies.set(GOAL_COOKIE, serializeGoal(goal), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}
