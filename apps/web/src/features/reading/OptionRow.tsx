import type { ReactNode } from "react";

/**
 * One option of a "choose one" (radio) or "choose several" (checkbox)
 * question, or of the mode choice: the approved answer-option look with a
 * native input, so the browser gives it keyboard and screen-reader behavior.
 */
export function OptionRow({
  type,
  name,
  value,
  checked,
  disabled = false,
  onChange,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  /** "Choose several" at its limit: the other options (DESIGN_SYSTEM.md, M4: disabled). */
  disabled?: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="group flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border-control bg-surface-base px-4 py-3 font-medium transition-colors hover:border-ink active:bg-surface-warm has-disabled:cursor-default has-disabled:border-border-subtle has-disabled:text-text-tertiary has-disabled:hover:border-border-subtle has-disabled:active:bg-surface-base has-checked:border-ink has-checked:bg-brand-blush has-checked:ring-1 has-checked:ring-ink has-checked:ring-inset has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink">
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      {/* 20 px indicator: a circle (one) or a square with a local 4 px corner (several). */}
      <span
        aria-hidden="true"
        className={`flex size-[1.25rem] shrink-0 items-center justify-center border-2 border-border-control group-has-checked:border-ink group-has-checked:bg-ink ${
          type === "radio" ? "rounded-full" : "rounded-[4px]"
        }`}
      >
        {type === "radio" ? (
          <span className="hidden size-2 rounded-full bg-surface-base group-has-checked:block" />
        ) : (
          <svg
            viewBox="0 0 16 16"
            className="hidden size-4 text-surface-base group-has-checked:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="m3 8 3.5 3.5L13 5" />
          </svg>
        )}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}
