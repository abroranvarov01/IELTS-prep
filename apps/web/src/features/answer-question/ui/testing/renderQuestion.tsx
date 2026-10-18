import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { type ReactNode, useState } from "react";
import {
  type Mode,
  type QuestionUnit,
  ReadingContext,
  type ReadingEvent,
  type ReadingSession,
  apply,
  questionUnits,
  startSession,
  unitOf,
} from "@/entities/reading";
import { demoTest, testSessionId } from "@/entities/reading/testing";
import type { ReadingTest } from "@/entities/reading";
import en from "../../../../../messages/en.json";
import ru from "../../../../../messages/ru.json";
import uz from "../../../../../messages/uz.json";

const catalogs = { en, ru, uz };

/**
 * Renders a question component for one question of the demo test with a real
 * session: answers go through the domain `apply`, as in the app.
 */
export function renderQuestion(
  number: number,
  ui: (unit: QuestionUnit) => ReactNode,
  options: {
    locale?: keyof typeof catalogs;
    mode?: Mode;
    test?: ReadingTest;
  } = {},
) {
  const { locale = "en", mode = "practice", test = demoTest } = options;
  const units = questionUnits(test);
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
