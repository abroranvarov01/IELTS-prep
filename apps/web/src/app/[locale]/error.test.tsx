import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import ru from "../../../messages/ru.json";
import LocaleError from "./error";

// The error state sits in the shell, whose language switcher reads the
// current path from the Next.js router, which a component test does not run.
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/ru/some-page",
}));

describe("locale error boundary", () => {
  it("explains the error in the interface language, retries on Try again, and links home", () => {
    const retry = vi.fn();
    render(
      <NextIntlClientProvider locale="ru" messages={ru}>
        <LocaleError retry={retry} />
      </NextIntlClientProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: ru.error.title }),
    ).toBeTruthy();
    expect(screen.getByText(ru.error.body)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: ru.common.goHome }).getAttribute("href"),
    ).toBe("/ru");

    fireEvent.click(screen.getByRole("button", { name: ru.error.retry }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
