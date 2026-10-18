import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { useState } from "react";
import {
  ListeningContext,
  type ListeningEvent,
  type ListeningSession,
  type Mode,
  apply,
  questionUnits,
  startSession,
} from "@/entities/listening";
import { fixtureListeningTest as test } from "@/entities/listening/testing";
import en from "../../../../../messages/en.json";
import ru from "../../../../../messages/ru.json";
import { GroupView } from "../GroupView";

const catalogs = { en, ru };
const units = questionUnits(test);

/** Renders one group of the fixture test with a real session: answers go through the domain `apply`, as in the app. */
export function renderGroup(
  partIndex: number,
  groupIndex: number,
  options: { locale?: keyof typeof catalogs; mode?: Mode } = {},
) {
  const { locale = "en", mode = "practice" } = options;
  const group = test.parts[partIndex]!.questionGroups[groupIndex]!;
  const latest: { session?: ListeningSession } = {};
  function Harness() {
    const [session, setSession] = useState(() =>
      startSession(test, mode, 1, "s-12345678-1234-4123-8123-123456789abc"),
    );
    latest.session = session;
    const send = (event: ListeningEvent) =>
      setSession((s) => apply(s, test, event, 2));
    return (
      <ListeningContext.Provider value={{ test, units, session, send }}>
        <GroupView group={group} />
      </ListeningContext.Provider>
    );
  }
  render(
    <NextIntlClientProvider locale={locale} messages={catalogs[locale]}>
      <Harness />
    </NextIntlClientProvider>,
  );
  return { latest };
}
