import { describe, expect, it } from "vitest";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";
import uz from "../../../messages/uz.json";
import { routing } from "./routing";

type Catalog = { [key: string]: string | Catalog };
type Locale = (typeof routing.locales)[number];

const catalogs: Record<Locale, Catalog> = { uz, ru, en };

function flatten(catalog: Catalog, prefix = ""): [string, string][] {
  return Object.entries(catalog).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[prefix + key, value]]
      : flatten(value, `${prefix}${key}.`),
  );
}

function keysOf(locale: Locale): string[] {
  return flatten(catalogs[locale])
    .map(([key]) => key)
    .sort();
}

describe("message catalogs", () => {
  it.each(routing.locales)(
    "%s has exactly the keys of the default locale",
    (locale) => {
      expect(keysOf(locale)).toEqual(keysOf(routing.defaultLocale));
    },
  );

  it.each(routing.locales)("%s has no empty messages", (locale) => {
    const empty = flatten(catalogs[locale])
      .filter(([, message]) => message.trim() === "")
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });
});
