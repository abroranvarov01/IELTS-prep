import type { ButtonHTMLAttributes, ReactNode } from "react";
import { CheckIcon } from "./icons";

/**
 * An answer that is chosen with one tap or Enter (DESIGN_SYSTEM.md, M3
 * components: answer option). A button, not a radio, so moving with the
 * keyboard never chooses by accident. The chosen one is marked by a check and
 * a heavier boundary, and named for screen readers, never by color alone.
 */
export function AnswerOption({
  selected,
  selectedLabel,
  children,
  ...button
}: {
  selected: boolean;
  selectedLabel: string;
  children: ReactNode;
} & Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "name" | "value" | "onClick"
>) {
  return (
    <button
      {...button}
      className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-start font-medium transition-colors hover:border-ink active:bg-surface-warm ${
        selected
          ? "border-ink bg-brand-blush-soft ring-1 ring-ink ring-inset"
          : "border-border-control bg-surface-base"
      }`}
    >
      <span className="min-w-0">{children}</span>
      {selected && (
        <>
          {/* The space keeps the spoken name two words: "Academic Selected". */}{" "}
          <span className="sr-only">{selectedLabel}</span>
          <CheckIcon className="size-[1.25rem]" />
        </>
      )}
    </button>
  );
}
