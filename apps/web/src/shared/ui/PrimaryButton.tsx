import type { ReactNode, Ref } from "react";
import { PRIMARY_ACTION } from "./primary-action";

/** The one red action of a screen, when it does something in place. */
export function PrimaryButton({
  onClick,
  ref,
  children,
}: {
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={PRIMARY_ACTION}
    >
      {children}
    </button>
  );
}
