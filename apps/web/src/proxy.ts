import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { readGoal } from "./data/goal-cookie";
import { LATER, firstUnansweredQuestion } from "./domain/onboarding";
import { routing } from "./i18n/routing";

const handleLocaleRouting = createMiddleware(routing);
const HOME = new RegExp(`^/(${routing.locales.join("|")})/?$`);

export default function proxy(request: NextRequest) {
  // Only home leads into onboarding, so direct links never do (USER_FLOWS.md).
  // The decision is made here, before rendering (ADR-0003).
  const home = HOME.exec(request.nextUrl.pathname);
  if (home && request.nextUrl.searchParams.get(LATER.param) !== LATER.value) {
    const question = firstUnansweredQuestion(readGoal(request.cookies));
    if (question) {
      return NextResponse.redirect(
        new URL(`/${home[1]}/start/${question}`, request.url),
      );
    }
  }
  return handleLocaleRouting(request);
}

export const config = {
  // All pathnames except /api, /_next, and files with an extension.
  matcher: "/((?!api|_next|.*\\..*).*)",
};
