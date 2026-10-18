import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { LabelledPicture } from "./LabelledPicture";

beforeAll(() => {
  // jsdom has no modal dialogs.
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(cleanup);

const image = {
  src: "plan.abababababab.svg",
  mimeType: "image/svg+xml" as const,
  width: 800,
  height: 520,
  alt: "Plan of a home",
  description: "A plan of a home. Number 31 is at the front door.",
  bytes: 1000,
  sha256: "ab".repeat(32),
  provenance: {
    producedBy: "Tests",
    method: "drawn" as const,
    license: "Original",
    producedAt: "2026-10-18",
  },
};
const labels = {
  enlarge: "Enlarge picture",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  close: "Close",
};

function renderPicture(current?: number) {
  render(
    <LabelledPicture
      src="/media/plan.svg"
      image={image}
      markers={[
        { id: "m1", label: "31", x: 15, y: 90, question: 31 },
        { id: "m2", label: "A", x: 50, y: 50, option: "A" },
      ]}
      currentQuestion={current}
      labels={labels}
    />,
  );
}

describe("a labelling picture", () => {
  it("has its short name and its long description as text alternatives", () => {
    renderPicture();
    const img = screen.getAllByRole("img", { name: "Plan of a home" })[0]!;
    expect(img.getAttribute("aria-describedby")).toBeTruthy();
    expect(
      document.getElementById(img.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toBe(image.description);
  });

  it("draws question numbers as squares and letters as circles, hidden from screen readers", () => {
    renderPicture();
    const number = screen.getAllByText("31")[0]!;
    const letter = screen.getAllByText("A")[0]!;
    expect(number.getAttribute("aria-hidden")).toBe("true");
    expect(number.className).toContain("rounded-sm");
    expect(letter.className).toContain("rounded-full");
    expect(number.style.left).toBe("15%");
  });

  it("marks the current question's marker", () => {
    renderPicture(31);
    expect(screen.getAllByText("31")[0]!.className).toContain(
      "bg-brand-blush-soft",
    );
  });

  it("opens an enlarged view whose zoom works with buttons", () => {
    renderPicture();
    fireEvent.click(screen.getByRole("button", { name: "Enlarge picture" }));
    const zoomIn = screen.getByRole("button", {
      name: "Zoom in",
    }) as HTMLButtonElement;
    const zoomOut = screen.getByRole("button", {
      name: "Zoom out",
    }) as HTMLButtonElement;
    expect(zoomOut.disabled).toBe(true);
    for (let i = 0; i < 3; i++) fireEvent.click(zoomIn);
    expect(zoomIn.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.querySelector("dialog")?.hasAttribute("open")).toBe(false);
  });
});
