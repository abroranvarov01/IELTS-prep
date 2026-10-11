import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { type ReactNode, useState } from "react";
import en from "../../../../messages/en.json";
import ru from "../../../../messages/ru.json";
import uz from "../../../../messages/uz.json";
import {
  demoTest as test,
  testSessionId,
} from "@/domain/reading/demo-test.fixture";
import {
  type Mode,
  type ReadingEvent,
  type ReadingSession,
  apply,
  startSession,
} from "@/domain/reading/session";
import {
  type QuestionUnit,
  questionUnits,
  unitOf,
} from "@/domain/reading/units";
import { ReadingContext } from "../reading-context";

const catalogs = { en, ru, uz };
const units = questionUnits(test);

/**
 * Renders a question component for one question of the demo test with a real
 * session: answers go through the domain `apply`, as in the app.
 */
export function renderQuestion(
  number: number,
  ui: (unit: QuestionUnit) => ReactNode,
  options: { locale?: keyof typeof catalogs; mode?: Mode } = {},
) {
  const { locale = "en", mode = "practice" } = options;
  const unit = unitOf(units, number);
  if (!unit) throw new Error(`no question ${number}`);
  const latest: { session?: ReadingSession } = {};

  function Harness() {
    const [session, setSession] = useState(() =>
      apply(
        startSession(test, mode, 1, testSessionId()),
        test,
        { type: "goTo", number },
        1,
      ),
    );
    latest.session = session;
    const send = (event: ReadingEvent) =>
      setSession((s) => apply(s, test, event, 1));
    return (
      <ReadingContext.Provider value={{ test, units, session, send }}>
        {ui(unit as QuestionUnit)}
      </ReadingContext.Provider>
    );
  }

  render(
    <NextIntlClientProvider locale={locale} messages={catalogs[locale]}>
      <Harness />
    </NextIntlClientProvider>,
  );
  return { latest, messages: catalogs[locale] };
}
