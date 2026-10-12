import type { ReactNode } from "react";
import { CheckIcon } from "./icons";

/**
 * One option of a "choose one" (radio) or "choose several" (checkbox)
 * question, or of the mode choice: the answer-option look with a native input,
 * so the browser gives it keyboard and screen-reader behavior. One boundary;
 * chosen is shown by a heavier boundary and a check, never by color alone.
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
    <label className="group flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border-control bg-surface-base px-4 py-3 font-medium transition-colors hover:border-ink active:bg-surface-warm has-checked:border-ink has-checked:bg-brand-blush-soft has-checked:ring-1 has-checked:ring-ink has-checked:ring-inset has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink has-disabled:cursor-default has-disabled:border-border-subtle has-disabled:text-text-tertiary has-disabled:hover:border-border-subtle has-disabled:active:bg-surface-base">
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      <span className="min-w-0 flex-1">{children}</span>
      {/* Its room is kept, so choosing never moves the text. */}
      <CheckIcon className="invisible size-[1.25rem] group-has-checked:visible" />
    </label>
  );
}
