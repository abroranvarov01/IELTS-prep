import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import ru from "../../../messages/ru.json";
import LocaleError from "./error";

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
